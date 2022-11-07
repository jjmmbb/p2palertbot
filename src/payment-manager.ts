import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Database } from './db'
import { AxiosClient } from './axios-client'

// Polling every 5 minutes, as this ideally should be
// just a backup. We should rely primarily on the webhook.
const PAYMENT_CHECK_INTERVAL = 1e3 * 60 * 5

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

  async createInvoice(
    amount: number,
    memo: string
  ) {
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
        return resp.data
      }
    } catch(err) {
      const msg = 'Error while trying to get invoice'
      console.error(msg)
      this.handleError(err)
      return { error: msg }
    }
  }
}