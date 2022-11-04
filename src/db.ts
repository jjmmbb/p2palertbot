import { PrismaClient, OrderType, Delivery } from '@prisma/client'

export class Database extends PrismaClient {

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

  async addUser(telegramId: bigint, chatId: bigint) {
    return this.user.create({
      data: { telegramId, chatId }
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
}