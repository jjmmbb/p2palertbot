import axios, { AxiosInstance } from 'axios'
import { Database } from './db'

export class LnbitsPaymentManager {
  private http: AxiosInstance
  private db: Database

  constructor() {
    this.http = axios.create({
      baseURL: process.env.LNBITS_BASE_URL
    })
    this.db = new Database()
  }

  async createInvoice(
    amount: number,
    memo: string,
    webhook: string
  ) {
    const data = {
      out: false,
      amount: amount * 1e3,
      unit: 'msats',
      memo, webhook
    }
    const config = {
      headers: {
        'X-Api-Key': process.env.LNBITS_READ_KEY,
        'Content-Type': 'application/json'
      }
    }
    const resp = await this.http.post(`/api/v1/payments`, data, config)
    if (resp.status === 201) {
      return resp.data
    }
  }
}