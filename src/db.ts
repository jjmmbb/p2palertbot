import { PrismaClient, OrderType } from '@prisma/client'

export class Database extends PrismaClient {

  async findUser(telegramId: bigint) {
    return this.user.findUnique({
      where: { telegramId }
    })
  }

  async addUser(telegramId: bigint) {
    return this.user.create({
      data: { telegramId }
    })
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

  async removeAllAlerts(userId: number) {
    return this.alert.deleteMany({
      where: { userId }
    })
  }
}