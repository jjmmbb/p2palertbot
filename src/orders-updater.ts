import axios, { AxiosInstance } from 'axios'
import { Database } from './db'
// 3 minutes
const INTERVAL = 60 * 3 * 1e3

export interface Order {
  _id: string,
  description: string
  tg_channel_message1: string,
  community_id: string
}

export type OnNotificationEvent =
  (userId: number, alertId: number, order: Order) => Promise<void>

export class OrdersUpdater {
  private db: Database = new Database()
  private onNotification: OnNotificationEvent | undefined
  private id: NodeJS.Timer | null = null
  private http: AxiosInstance

  constructor() {
    this.http = axios.create({
      baseURL: process.env.LNP2PBOT_BASE_URL
    })
  }

  start(onNotification: OnNotificationEvent) {
    this.onNotification = onNotification
    this.id = setInterval(this.updateOrders, INTERVAL)
  }

  updateOrders = async () => {
    if (!this.http) {
      return console.log('http is undefined')
    }
    const resp = await this.http.get('/orders')
    const { data } = resp
    const orders: Order[] = data
    const fiatCodeMap = new Map<string, boolean>()
    orders.map((o:any) => o.fiat_code)
      .forEach((fiatCode: string) => {
        if (!fiatCodeMap.has(fiatCode)) {
          fiatCodeMap.set(fiatCode, true)
        }
      })
    // TODO: Store these in the db
    // console.log('Fiat codes: ', fiatCodeMap.keys())
    const users = await this.db.findAllUsers()
    for (const user of users) {
      // Fetching all alerts of a user
      const alerts = await this.db.findAlertsByUser(user.id)
      for (const alert of alerts) {
        const filtered = orders.filter((o: any) => {
          if (o.fiat_code.toUpperCase() !== alert.currency.toUpperCase()) {
            return false
          }
          if (o.type.toUpperCase() !== alert.orderType.toUpperCase()) {
            return false
          }
          if (!o.price_from_api) {
            return false
          }
          if (o.type === 'SELL') {
            return o.price_margin <= alert.priceDelta
          } else {
            return o.price_margin >= alert.priceDelta
          }
        })
        for(const order of filtered) {
          const delivery = await this.db.findDelivery(user.id, alert.id, order._id)
          if (delivery !== null) {
            // The user was already notified of this order
            continue
          } else {
            // Notify user & record delivery
            if (this.onNotification)
              await this.onNotification(user.id, alert.id, order)
            else
              console.warn('Not issuing notification because callback is undefined')
          }
        }
      }
    }
  }
}