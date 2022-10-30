import { PrismaClient } from '@prisma/client'

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
}