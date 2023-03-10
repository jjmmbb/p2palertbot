import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Database } from './db'
import { AxiosClient } from './axios-client'
import { User, Subscription } from '@prisma/client'
import * as bolt11 from 'bolt11'
import { logger } from './logger'

// Polling every 5 minutes, as this ideally should be
// just a backup. We should rely primarily on the webhook.
const PAYMENT_CHECK_INTERVAL = 1e3 * 60 * 5

export type PaymentCreationResponse = {
  payment_request?: string,
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
      const { paymentHash, id, created, duration } = pendingPayment
      if (Date.now() > created.getTime() + duration * 1e3) {
        // Expired unpaid invoice, ignoring
        continue
      }
      try {
        const resp = await this.http.get(
          `/api/v1/payments/${paymentHash}`,
          this.config
        )
        if (resp.status === 200) {
          const { paid } = resp.data
          if (paid) {
            await this.db.updatePayment(id, true)
            logger.info(`payment ${paymentHash} is now paid!`)
          } else {
            logger.info(`payment ${paymentHash} is still pending`)
          }
        } else {
          logger.warn(
            'Error trying to fetch payment state. body: ', resp.data
          )
        }
      } catch(err) {
        console.error('Error while checking for payment. err: ', err)
      }
    }
  }

  // This is introduced because while in development mode we rely on ngrok,
  // in production we want to combine WEBHOOK_URL & WEBHOOK_PORT
  getWebhook = () => process.env.NODE_ENV === 'production' ?
    `${process.env.WEBHOOK_URL}:${process.env.WEBHOOK_PORT}` : process.env.WEBHOOK_URL

  async createPayment(
    user: User,
    amount: number,
    subscription: Subscription
  ) : Promise<PaymentCreationResponse> {
    const { duration } = subscription
    const memo = `subscription for user ${user.id}, good for ${duration} secs`
    const webhook = this.getWebhook()
    const data = {
      out: false,
      amount: amount,
      webhook: webhook,
      unit: 'sat',
      memo
    }
    logger.info(`creating payment. telegram user: ${user.id}, amount: ${amount} sats, webhook: ${webhook}`)
    try {
      const resp = await this.http.post(`/api/v1/payments`, data, this.config)
      if (resp.status === 201) {
        const {
          payment_hash,
          payment_request,
          error
        } = resp.data
        if (error) {
          logger.error('Invoice generation error: ', error)
          return { error: 'error_invoice_generation' }
        }
        const { timestamp, timeExpireDate } = bolt11.decode(payment_request)
        if (!timestamp || !timeExpireDate) {
          return {
            error: 'error_invalid_invoice'
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
        return { payment_request }
      } else {
        return { error: 'error_unexpected_response_code_create_invoice' }
      }
    } catch(err) {
      this.handleError(err)
      return { error: 'error_payment_creation' }
    }
    return {}
  }
}