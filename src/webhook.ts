import express, { Application, Request, Response } from 'express'
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

export class WebhookListener {
  private app: Application
  private db: Database = new Database()
  private callback: OnPaymentUpdated
  private PORT: number
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
    if (!pending) {
      const payment = await this.db.findPaymentByHash(payment_hash)
      if (payment) {
        await this.db.updatePayment(payment.id, true)
        // @ts-ignore
        const subscription: Subscription = payment.subscription
        this.callback(payment.id, subscription.userId, true)
      }
    }
    res.status(201).end()
  }
}