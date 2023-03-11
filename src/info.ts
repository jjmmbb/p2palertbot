import { Subscription, Payment } from '@prisma/client'
import { BotContext } from './types'
import { Database } from './db'

const handleInfo = async (ctx: BotContext, db: Database) => {
  const {
    update: {
      message: { chat , from: { id, is_bot, language_code } }
    }
  } = ctx
  const telegramId = BigInt(id)
  const chatId = BigInt(chat.id)
  const user = await db.findUserByTelegramId(telegramId)
  if (!user) {
    const language = language_code ? language_code : 'en'
    await db.addUser(telegramId, chatId, language)
    return ctx.reply(ctx.t('welcome'))
  }
  const subscriptions: Subscription[] = await db.findSubscriptionsByUserId(user.id)
  const paidActiveSubscriptions: Subscription[] = subscriptions
    .filter(sub => sub.created.getTime() + sub.duration * 1e3 > Date.now())
    .map((sub: Subscription) => {
      //@ts-ignore
      sub.payment = sub.payment.map((payment: Payment) => ({ paid: payment.paid, amount: payment.amount }))
      return sub
    })
    .filter((sub: Subscription) => {
      //@ts-ignore
      const paid = sub.payment.reduce((accum, sub) => accum || sub.paid, false)
      return paid
    })
  const totalPaid = subscriptions.map((sub: Subscription) => {
      //@ts-ignore
      const paidAmount = sub.payment
        .map((payment: Payment) => payment.paid ? payment.amount : BigInt(0))
        .reduce((accum: number, paid: number) => accum + paid, BigInt(0))
      return paidAmount
    })
    .reduce((accum: number, paid: number) => accum + paid, BigInt(0))
  
  const alerts = await db.findAlertsByUser(user.id)
  const translationContext = {
    subscriptionCount: subscriptions.length,
    activeCount: paidActiveSubscriptions.length,
    totalPaid: `${totalPaid}`,
    alertsCount: alerts.length,
  }
  ctx.reply(ctx.t('info', translationContext), { parse_mode: 'HTML'})
}

export default handleInfo