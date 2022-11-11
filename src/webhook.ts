import express, { Application, Request, Response } from 'express'
import axios, { AxiosInstance } from 'axios'
import { Subscription } from '@prisma/client'
import { Database } from './db'

const DEFAULT_PORT: number = 3005

export type OnPaymentUpdated = (
  paymentId: number,
  userId: number,
  isPaid: boolean
) => Promise<void>

interface InvoiceUpdate {
  checking_id: string,
  pending: boolean,
  amount: number,
  fee: number,
  memo: string,
  time: number,
  bolt11: string,
  preimage: string,
  payment_hash: string,
  wallet_id: string,
  webhook: string
}

/**
 * Sometimes it seems like the websocket notification is delivered too fast by lnbits.
 * So fast that the 'pending' attribute is still true.
 * We thus need to schedule a second check. This constant specifies the delay until
 * this second attempt in milliseconds.
 */
const PENDING_PAYMENT_SECOND_CHECK_DELAY = 1000

export class WebhookListener {
  private app: Application
  private db: Database = new Database()
  private callback: OnPaymentUpdated
  private PORT: number
  private http: AxiosInstance
  constructor(callback: OnPaymentUpdated) {
    this.callback = callback
    this.app = express()
    this.app.use(express.json())
    this.app.post('/', this.webhookHandler)
    const port = process.env.WEBHOOK_PORT ? parseInt(process.env.WEBHOOK_PORT) : NaN
    if (!isNaN(port)) {
      this.PORT = port
    } else {
      this.PORT = DEFAULT_PORT
    }
    this.http = axios.create({
      baseURL: process.env.LNBITS_BASE_URL
    })
  }

  listen() {
    this.app.listen(this.PORT, () => {
      console.log(`Webhook listening at port ${this.PORT}`)
    })
  }

  webhookHandler = async (req: Request, res: Response) => {
    const update: InvoiceUpdate = req.body
    console.log('update: ', update)
    const { payment_hash, pending } = update
    if (!pending && false) {
      // const payment = await this.db.findPaymentByHash(payment_hash)
      // if (payment) {
      //   await this.db.updatePayment(payment.id, true)
      //   // @ts-ignore
      //   const subscription: Subscription = payment.subscription
      //   this.callback(payment.id, subscription.userId, true)
      // }
    } else {
      // Scheduling a second verification just 500 ms after this
      setTimeout(
        this.checkPendingPayment,
        PENDING_PAYMENT_SECOND_CHECK_DELAY,
        payment_hash)
    }
    res.status(201).end()
  }

  checkPendingPayment = async (paymentHash: string) => {
    try {
      const config = {
        headers: {
          'X-Api-Key': process.env.LNBITS_READ_KEY,
          'Content-Type': 'application/json'
        }
      }
      const resp = await this.http.get(
        `/api/v1/payments/${paymentHash}`,
        config
      )
      if (resp.status === 200) {
        const { paid } = resp.data
        if (paid) {
          const payment = await this.db.findPaymentByHash(paymentHash)
          if (payment) {
            await this.db.updatePayment(payment.id, true)
            console.log(`payment ${paymentHash} is now paid!`)
            // @ts-ignore
            const subscription: Subscription = payment.subscription
            this.callback(payment.id, subscription.userId, true)
          } else {
            console.warn(`could not find payment in database. payment hash: ${paymentHash}`)
          }
        } else {
          console.log(`payment ${paymentHash} is still pending`)
        }
      } else {
        console.warn(
          'Error trying to fetch payment state. body: ', resp.data
        )
      }
    } catch(err) {
      console.error('Error while trying to fetch payment status for the second time')
    }
  }
}