import axios, { AxiosInstance } from 'axios'
import { User } from '@prisma/client'
import { Database } from './db'
import { logger } from './logger'
import { NostrNotifier } from './nostr'

// 3 minutes
const INTERVAL = 3 * 60 * 1e3

export interface Order {
  _id: string,
  description: string
  amount: number,
  fee: number,
  bot_fee: number,
  community_fee: number,
  status: string,
  type: string,
  fiat_amount: number,
  min_amount?: number,
  max_amount?: number,
  fiat_code: string,
  payment_method: string,
  taken_at?: string,
  tg_chat_id?: string,
  tg_order_message?: string,
  tg_channel_message1: string,
  price_from_api: boolean,
  price_margin: number,
  community_id: string,
  is_public: boolean,
  created_at: string
}

export type OnNotificationEvent =
  (userId: number, alertId: number, order: Order) => Promise<void>

export class OrdersUpdater {
  private db: Database = new Database()
  private onNotification: OnNotificationEvent | undefined
  private id: NodeJS.Timer | null = null
  private http: AxiosInstance
  private nostr: NostrNotifier

  constructor() {
    this.http = axios.create({
      baseURL: process.env.LNP2PBOT_BASE_URL
    })
    this.nostr = new NostrNotifier
  }

  start(onNotification: OnNotificationEvent) {
    this.onNotification = onNotification
    this.id = setInterval(this.updateOrders, INTERVAL)
  }

  updateOrders = async () => {
    logger.info('🔄 Updating orders')
    try {
      const resp = await this.http.get('/orders')
      const { data } = resp
      const orders: Order[] = data
      const users = await this.db.findAllUsers()
      for (const user of users) {
        let notificationCounter = 0
        let discardedNotificationCounter = 0
        // Checking if user's payment is up to date
        const isSubscribed = await this.checkUserSubscription(user)
        logger.info(`user: ${user.id}, subscribed: ${isSubscribed}`)
        if (!isSubscribed) {
          continue
        }
        // Fetching all alerts of a user
        const alerts = await this.db.findAlertsByUser(user.id)
        for (const alert of alerts) {
          const filteredOrders = orders.filter((o: any) => {
            if (o.fiat_code.toUpperCase() !== alert.currency.toUpperCase()) {
              return false
            }
            if (o.type.toUpperCase() !== alert.orderType.toUpperCase()) {
              return false
            }
            if (!o.price_from_api) {
              return false
            }
            if (o.type.toUpperCase() === 'SELL') {
              return o.price_margin <= alert.priceDelta
            } else {
              return o.price_margin >= alert.priceDelta
            }
          })
          for(const order of filteredOrders) {
            const delivery = await this.db.findDelivery(user.id, alert.id, order._id)
            if (delivery !== null) {
              discardedNotificationCounter++
              // The user was already notified of this order
              continue
            } else {
              // Notify user & record delivery
              if (this.onNotification) {
                await this.onNotification(user.id, alert.id, order)
                notificationCounter++
              } else {
                logger.warn('Not issuing notification because callback is undefined')
              }
            }
          }
        }
        logger.info(`user: ${user.id}, telegram: ${user.telegramId}, 📝:${alerts.length}, 📢:${notificationCounter}, 🗑️: ${discardedNotificationCounter}`)
      }
      // Adding new orders and sending them as nostr events
      for (const order of orders) {
        const exists = await this.db.findOrderById(order._id)
        if (!exists) {
          await this.db.addOrder(order)
          this.nostr.notify(order)
        }
      }
    } catch(err) {
      console.error('Error while trying to fetch orders. Err: ', err)
    }
  }

  private async checkUserSubscription(user: User) : Promise<Boolean>{
    let isSubscribed = false
    const subscriptions = await this.db.findSubscriptionsByUserId(user.id)
    for (const subscription of subscriptions) {
      const { created, duration, id } = subscription
      if (created.getTime() + duration * 1e3 > Date.now()) {
        // Subscription can be active, checking for payments now
        const payment = await this.db.findPaymentBySubscriptionId(id, true)
        if (payment?.paid) {
          isSubscribed = true
        }
      }
    }
    return isSubscribed
  }
}