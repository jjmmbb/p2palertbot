import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Database } from './db'
import { AxiosClient } from './axios-client'
import { User, Subscription } from '@prisma/client'
import * as bolt11 from 'bolt11'

// Polling every 5 minutes, as this ideally should be
// just a backup. We should rely primarily on the webhook.
const PAYMENT_CHECK_INTERVAL = 1e3 * 60 * 5

export type PaymentCreationResponse = {
  msg?: string,
  error?: any
}

export class LnbitsPaymentManager extends AxiosClient{
  private http: AxiosInstance
  private db: Database
  private id: NodeJS.Timer
  private config: AxiosRequestConfig

  constructor() {
    super()
    this.http = axios.create({
      baseURL: process.env.LNBITS_BASE_URL
    })
    this.db = new Database()
    this.id = setInterval(this.checkPayments, PAYMENT_CHECK_INTERVAL)
    this.config = {
      headers: {
        'X-Api-Key': process.env.LNBITS_READ_KEY,
        'Content-Type': 'application/json'
      }
    }
  }

  checkPayments = async () => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3)
    const pendingPayments = await this.db.getPendingPayments(dayAgo)
    for (const pendingPayment of pendingPayments) {
      const { paymentHash, id } = pendingPayment
      const resp = await this.http.get(
        `/api/v1/payments/${paymentHash}`,
        this.config
      )
      if (resp.status === 200) {
        const { paid } = resp.data
        if (paid) {
          await this.db.updatePayment(id, true)
          console.log(`payment ${paymentHash} is now paid!`)
        } else {
          console.log(`payment ${paymentHash} is still pending`)
        }
      } else {
        console.warn(
          'Error trying to fetch payment state. body: ', resp.data
        )
      }
    }
  }

  async createPayment(
    user: User,
    amount: number,
    subscription: Subscription
  ) : Promise<PaymentCreationResponse> {
    const { duration } = subscription
    const memo = `subscription for user ${user.id}, good for ${duration} secs`
    const data = {
      out: false,
      amount: amount,
      webhook: process.env.WEBHOOK_URL,
      unit: 'sat',
      memo
    }
    try {
      const resp = await this.http.post(`/api/v1/payments`, data, this.config)
      if (resp.status === 201) {
        // return resp.data
        const {
          payment_hash,
          payment_request,
          error
        } = resp.data
        if (error) return { error: error }
        const { timestamp, timeExpireDate } = bolt11.decode(payment_request)
        if (!timestamp || !timeExpireDate) {
          return {
            error: 'Error: invalid invoice returned by provider, cannot proceed'
          }
        }
        const duration = timeExpireDate - timestamp
        await this.db.createPayment(
          amount,
          payment_hash,
          subscription.id,
          duration,
          new Date(timestamp * 1e3),
          payment_request
        )
        const msg = `Please pay the following invoice: <code>${payment_request}</code>`
        return { msg }
      }
    } catch(err) {
      const msg = 'Error while trying to get invoice'
      console.error(msg)
      this.handleError(err)
      return { error: msg }
    }
    return {}
  }
}