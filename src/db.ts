import { PrismaClient, OrderType, Delivery, Subscription, Payment } from '@prisma/client'
import { Order } from './orders-updater'

export class Database extends PrismaClient {
  findOrderById(id: string) {
    return this.order.findUnique({
      where: { id }
    })
  }

  addOrder(order: Order) {
    return this.order.create({
      data: {
        id: order._id,
        description: order.description,
        amount: order.amount,
        fee: order.fee,
        botFee: order.bot_fee,
        communityFee: order.community_fee,
        status: order.status,
        type: order.type,
        fiatAmount: order.fiat_amount,
        minAmount: order.min_amount,
        maxAmount: order.max_amount,
        fiatCode: order.fiat_code,
        paymentMethod: order.payment_method,
        takenAt: order.taken_at,
        tgChatId: order.tg_chat_id,
        tgOrderMessage: order.tg_order_message,
        tgChannelMessage1: order.tg_channel_message1,
        priceFromApi: order.price_from_api,
        priceMargin: order.price_margin,
        communityId: order.community_id,
        isPublic: order.is_public,
        createdAt: order.created_at
      }
    })
  }

  async findUserById(id: number) {
    return this.user.findUnique({
      where: { id }
    })
  }

  async findUserByTelegramId(telegramId: bigint) {
    return this.user.findUnique({
      where: { telegramId }
    })
  }

  async addUser(telegramId: bigint, chatId: bigint, language: string) {
    return this.user.create({
      data: { telegramId, chatId, language }
    })
  }

  async findAllUsers() {
    return this.user.findMany({})
  }

  async addAlert(
    userId: number,
    currency: string,
    priceDelta: number,
    orderType: OrderType
  ) {
    return this.alert.create({
      data: {userId, currency, priceDelta, orderType}
    })
  }

  async updateAlert(
    alertId: number,
    priceDelta: number
  ) {
    return this.alert.update({
      where: { id: alertId },
      data: { priceDelta }
    })
  }

  async findAlert(
    userId: number,
    currency: string,
    orderType: OrderType
  ) {
    return this.alert.findFirst({
      where: {userId, currency, orderType}
    })
  }

  async findAlertsByUser(userId: number) {
    return this.alert.findMany({
      where: { userId }
    })
  }

  /**
   * Finds all the alerts that a specific order would trigger
   * @param order - The new order
   */
  async findAlertsByOrder(order: Order) {
    const whereInput = {
      currency: order.fiat_code.toUpperCase(),
      orderType: order.type.toUpperCase() === OrderType.BUY ? OrderType.BUY : OrderType.SELL,
      priceDelta: {}
    }
    if (order.type.toUpperCase() === OrderType.BUY) {
      whereInput.priceDelta = { lte: order.price_margin }
    } else {
      whereInput.priceDelta = { gte: order.price_margin }
    }
    return this.alert.findMany({ where: whereInput })
  }

  async findAlertById(id: number) {
    return this.alert.findUnique({
      where: { id }
    })
  }

  async removeAllAlerts(userId: number) {
    return this.alert.deleteMany({
      where: { userId }
    })
  }

  async removeAlertById(id: number) {
    return this.alert.delete({
      where: { id }
    })
  }

  async addDelivery(
    userId: number,
    alertId: number,
    orderId: string
  ) {
    return this.delivery.create({
      data: { userId, alertId, orderId }
    })
  }

  async findDelivery(
    userId: number,
    alertId: number,
    orderId: string
  ) : Promise<Delivery | null>  {
    return this.delivery.findFirst({
      where: { userId, alertId, orderId}
    })
  }

  async findSubscriptionsByUserId(
    userId: number
  ) : Promise<Subscription[]> {
    return this.subscription.findMany({
      where: { userId },
      include: { payment: true }
    })
  }

  async findCurrentSubscriptions(
    userId: number
  ) : Promise<(Subscription & { payment: Payment[] })[]> {
    const subscriptions = await this.subscription.findMany({
      where: { userId },
      include: { payment: true }
    })
    return subscriptions
      .filter(sub => {
        const created = Math.trunc(sub.created.getTime() / 1e3)
        const expires = Math.trunc(created + sub.duration)
        const now = Math.trunc(Date.now() / 1e3)
        return expires > now
      })
  }

  async createSubscription(
    userId: number,
    duration: number
  ) : Promise<Subscription> {
    return this.subscription.create({
      data: { userId, duration },
      include: { payment : true}
    })
  }

  async createPayment(
    amount: number,
    paymentHash: string,
    subscriptionId: number,
    duration: number,
    created: Date,
    invoice: string
  ) : Promise<Payment> {
    return this.payment.create({
      data: { paymentHash, subscriptionId, amount, duration, created, invoice }
    })
  }

  async findPaymentByHash(paymentHash: string) : Promise<Payment | null> {
    return this.payment.findUnique({
      where: {
        paymentHash
      },
      include: {
        subscription: true
      }
    })
  }

  async getPendingPayments(
    newer: Date
  ) {
    return this.payment.findMany({
      where: {
        paid: false,
        created: {
          gt: newer
        }
      }
    })
  }

  async findPaymentBySubscriptionId(
    subscriptionId: number,
    paid: boolean
  ) : Promise<Payment | null> {
    return this.payment.findFirst({
      where: {
        subscriptionId, paid
      }
    })
  }

  async findPaymentsBySubscription(
    subscriptionId: number
  ) : Promise<Payment[]> {
    return await this.payment.findMany({
      where: { subscriptionId: subscriptionId }
    })
  }

  async updatePayment(
    id: number,
    isPaid: boolean
  ) {
    return this.payment.update({
      where: { id },
      data: { paid: isPaid}
    })
  }
}