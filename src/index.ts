import * as dotenv from 'dotenv'
dotenv.config()
import axios from 'axios'
import { OrderType, User, Subscription } from '@prisma/client'
import { Telegraf } from 'telegraf'
import { I18n } from '@grammyjs/i18n'
import { Database } from './db'
import { OrdersUpdater, OnNotificationEvent, Order } from './orders-updater'
import { LnbitsPaymentManager } from './payment-manager'
import { WebhookListener, OnPaymentUpdated } from './webhook'
import { BotContext } from './types'
import fs from 'fs'
import { logger } from './logger'
import { SubscriptionCosts, COST_PER_DAY } from './subscription-costs'
const fiat = JSON.parse(fs.readFileSync('./data/fiat.json', 'utf-8'))

const BOT_TOKEN = process.env.BOT_TOKEN
const CURRENCIES = Object.values(fiat).map((f:any) => f.code)

const ORDER_TYPES = ['BUY', 'SELL']

const db = new Database()
const paymentManager = new LnbitsPaymentManager()
const i18nConfig = {
  directory: 'lang',
  useSession: true,
  defaultLocale: 'en'
}

const main = async () => {
  if (BOT_TOKEN === undefined) {
    logger.error('BOT_TOKEN undefined')
    return
  }
  const onPaymentUpdated: OnPaymentUpdated = (
    paymentId: number,
    userId: number,
    isPaid: boolean
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await db.findUserById(userId)
        if (user?.telegramId) {
          const i18n = new I18n(i18nConfig)
          await bot.telegram.sendMessage(
            user.telegramId.toString(),
            i18n.t('es', 'payment_detected')
          )
        }
        resolve()
      } catch(err) {
        reject(err)
      }
    })
  }

  const i18n = new I18n<BotContext>(i18nConfig)
  const bot = new Telegraf<BotContext>(BOT_TOKEN)
  bot.use(i18n.middleware())
  bot.start(async (ctx) => {
    ctx.update.message.chat.id
    const {
      update: {
        message: { chat , from: { id, is_bot, language_code } }
      }
    } = ctx
    const telegramId = BigInt(id)
    const chatId = BigInt(chat.id)
    const user = await db.findUserByTelegramId(telegramId)
    if (is_bot) {
      return ctx.reply(ctx.t('no_bots'))
    }
    if (!user) {
      const language = language_code ? language_code : 'en'
      await db.addUser(telegramId, chatId, language)
      return ctx.reply(ctx.t('welcome'))
    }
    ctx.reply(ctx.t('welcome_back'))
  })
  bot.help(
    ctx => ctx.reply(ctx.t('help'))
  )
  bot.command('addalert', async (ctx) => {
    const { update: { message: { text }}} = ctx
    handleAddAlert(ctx, text.split(' '))
  })
  bot.command('listalerts', ctx => handleListAlerts(ctx))
  bot.command('editalert', ctx => ctx.reply(ctx.t('edit_alert_placeholder')))
  bot.command('cancelalert', ctx => {
    const { update: { message: { text } } } = ctx
    handleCancelAlert(ctx, text.split(' '))
  })
  bot.command('cancelall', ctx => handleCancelAll(ctx))
  bot.command('subscribe', ctx => {
    const { update: { message: { text }}} = ctx
    const args = text.split(' ')
    handleSubscribe(ctx, args)
  })
  bot.command('info', ctx => handleInfo(ctx))
  bot.command('about', ctx => handleAbout(ctx))

  try {
    await bot.launch()
  } catch(e) {
    logger.error('error: ', e)
  }

  const onNotification: OnNotificationEvent = (
    userId: number,
    alertId: number,
    order: Order,
  ) => {
    return new Promise(async (resolve, reject) => {
      const http = axios.create({
        baseURL: process.env.LNP2PBOT_BASE_URL
      })
      try {
        const user = await db.findUserById(userId)
        if (user && bot.telegram) {
          let msg = `${order.description}\n`
          // TODO: Store community data in the database, so that we
          // don't have to query this all the time.
          try {
            let channel = ''
            if (order.community_id) {
              const resp = await http.get(`/community/${order.community_id}`)
              const { data } = resp
              channel = data.group.split('@')[1]
            } else {
              channel = 'p2plightning'
            }
            const url = `https://t.me/${channel}/${order.tg_channel_message1}`
            if (url !== '') {
              msg += `<a href="${url}">${order._id}</a>\n`
            } else {
              msg += `<i>${order._id}</i>\n`
            }
          } catch(err) {
            logger.error('Error while trying to fetch community data: ', err)
          }
          await bot.telegram.sendMessage(user.chatId.toString(), msg, {parse_mode: 'HTML'})
          await db.addDelivery(userId, alertId, order._id)
        } else {
          logger.warn(`Not notifying user with id ${userId}. user: `, user, ', bot.telegram: ', bot.telegram)
        }
        resolve()  
      } catch(err) {
        reject(err)
      }
    })
  }  

  // Instantiating OrdersUpdater
  const updater = new OrdersUpdater()
  updater.start(onNotification)

  // Setting up the webhook listener
  const webhook = new WebhookListener(onPaymentUpdated)
  webhook.listen()

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

const getUser = async (
  ctx: BotContext
) : Promise<User | null> => {
  const { update: { message: { from: { id } } } } = ctx
  const user = await db.findUserByTelegramId(BigInt(id))
  if (!user) {
    await ctx.reply(ctx.t('not_introduced'))
    await ctx.reply(ctx.t('start_prompt'), { parse_mode: 'HTML' })
  }
  return user
}

const handleAddAlert = async (
  ctx: BotContext,
  args: string[]
) => {
  if (args.length !== 4) {
    await ctx.reply(ctx.t('addalert_invalid_argument'))
    await ctx.reply(ctx.t('addalert_sample_l1'))
    return await ctx.reply(ctx.t('addalert_sample_l2'))
  }
  const [cmd, currency, priceDeltaStr, orderTypeStr] = args
  const priceDelta = parseFloat(priceDeltaStr)
  if (Number.isNaN(priceDelta)) {
    return ctx.reply(ctx.t('invalid_premium_or_discount'))
  }
  if (!CURRENCIES.find(c => c.toLowerCase() === currency.toLowerCase())) {
    return ctx.reply(ctx.t('invalid_currency'))
  }
  if (!ORDER_TYPES.find(o => o.toLowerCase() === orderTypeStr.toLowerCase())) {
    return ctx.reply(ctx.t('invalid_order_type'))
  }
  const user = await getUser(ctx)
  if (!user) return
  const orderType = orderTypeStr.toUpperCase() === OrderType.BUY
    ? OrderType.BUY : OrderType.SELL
  try {
    const existingAlert = await db.findAlert(user.id, currency, orderType)
    if (existingAlert) {
      await db.updateAlert(existingAlert.id, priceDelta)
    } else {
      await db.addAlert(user.id, currency, priceDelta, orderType)
    }
  } catch(err) {
    logger.error('Error while trying to add/update alert: ', err)
    return await ctx.reply(ctx.t('addalert_error'))
  }
  const subscriptions = await db.findSubscriptionsByUserId(user.id)
  logger.info(`looking for subscriptions for user: ${user.id}, got ${subscriptions.length}`)
  if (subscriptions.length === 0) {
    return await ctx.reply(ctx.t('alert_added_without_subscription'))
  } else {
    const activeSubscriptions = subscriptions
      .filter(sub => sub.created.getTime() + sub.duration * 1e3 > Date.now())
    if (activeSubscriptions.length === 0) {
      return await ctx.reply(ctx.t('alert_added_without_active_subscription'))
    } else {
      logger.info(`active subscriptions: ${activeSubscriptions.length}`)
      const activeAndPaidSubscriptions = []
      for (const activeSubscription of activeSubscriptions) {
        const payments = await db.findPaymentsBySubscription(activeSubscription.id)
        const isPaid = payments.reduce((accum, payment) => accum || payment.paid, false)
        if (isPaid) {
          activeAndPaidSubscriptions.push(activeSubscription)
        }
      }
      logger.info(`active & paid subscriptions: ${activeAndPaidSubscriptions.length}`)
      if (activeAndPaidSubscriptions.length > 0) {
        const position = orderType === OrderType.BUY ? ctx.t('above') : ctx.t('below')
        const transationContext = {
          position, currency, priceDelta, orderType: ctx.t(orderType.toLowerCase())
        }
        return await ctx.reply(ctx.t('addalert_success', transationContext))
      } else {
        return await ctx.reply(ctx.t('alert_added_without_paid_subscription'))
      }
    }
  }
}

const handleListAlerts = async (
  ctx: BotContext
) => {
  const user = await getUser(ctx)
  if (user) {
    const alerts = await db.findAlertsByUser(user.id)
    let list = ctx.t('alert_list_title') + '\n'
    for(const alert of alerts) {
      const { id, currency, priceDelta, orderType } = alert
      const flag = orderType === OrderType.BUY ? '🟢' : '🔴'
      const direction = orderType === OrderType.BUY ? '⬆️': '⬇️'
      const translatedOrderType = orderType === OrderType.BUY ? ctx.t('buy') : ctx.t('sell')
      const transationContext = {
        id, flag, direction, priceDelta,
        orderType: translatedOrderType,
        currency: currency.toUpperCase()
      }
      const line = ctx.t('alert_list_item', transationContext) + '\n'
      list += line
    }
    ctx.reply(list, {parse_mode: 'HTML'})
  }
}

const handleCancelAll = async (
  ctx: BotContext
) => {
  const user = await getUser(ctx)
  if (user) {
    const { count } = await db.removeAllAlerts(user.id)
    if (count === 0) return await ctx.reply(ctx.t('no_alerts_to_remove'))
    const msg = count === 1 ?
      ctx.t('alert_removed_single') : ctx.t('alert_removed_multiple', { count })
    await ctx.reply(msg)
  }
}

const handleCancelAlert = async (
  ctx: BotContext,
  args: string[]
) => {
  const user = await getUser(ctx)
  if (user) {
    if (args.length !== 2) {
      await ctx.reply(ctx.t('error_cancel_alert_invalid_argument'))
      await ctx.reply(ctx.t('error_cancel_alert_ex'))
      return await ctx.reply(ctx.t('error_cancel_alert_suggestion'))
    }
  }
  const [ cmd, alertIdStr ] = args
  const alertId = parseInt(alertIdStr)
  if (Number.isNaN(alertId)) {
    return await ctx.reply(ctx.t('error_cancel_alert_invalid_id'))
  }
  let alert = db.findAlertById(alertId)
  try {
    if (alert !== null) {
      await db.removeAlertById(alertId)
      return await ctx.reply(ctx.t('cancel_alert_success', { alertId }))
    } else {
      return await ctx.reply(ctx.t('error_cancel_alert', {alertId}))
    }
  } catch(err) {
    logger.error('Error while removing alert. err: ', err)
  }
}

const createPayment = async (
  user: User,
  amount: number,
  subscription: Subscription,
  ctx: BotContext
) => {
  const {
    payment_request,
    error
  } = await paymentManager.createPayment(user, amount, subscription)
  if (error) return await ctx.reply(ctx.t(error))
  const msg = ctx.t('pay_invoice_prompt') + ` <code>${ payment_request }</code>`
  if (payment_request) return await ctx.reply(msg, {parse_mode: 'HTML'})
  // Should never happen, but just in case
  else return await ctx.reply(ctx.t('unexpected_result_payment_creation'))
}

const handleSubscribe = async (
  ctx: BotContext,
  args: string[]
) => {
  const user = await getUser(ctx)
  if (!user) {
    return
  }
  let days: number | undefined = undefined
  if (args.length !== 2) {
    return await ctx.reply(ctx.t('help_subscription', {costPerDay: COST_PER_DAY}), {parse_mode: 'HTML'})
  } else {
    days = parseInt(args[1])
    if (isNaN(days)) {
      return await ctx.reply(ctx.t('wrong_duration'))
    }
    let currentSubscriptions = await db.findCurrentSubscriptions(user.id)
    // First we look for a paid subscription that is current
    const paidSubscriptions = currentSubscriptions.filter(sub => {
      const isPaid = sub.payment.reduce((accum, payment) => accum || payment.paid, false)
      return isPaid
    })
    if (paidSubscriptions.length === 1) {
      // Only 1 subscription really can be paid & current
      // Active subscription is paid, user doesn't need any other payment
      return await ctx.reply(ctx.t('subscription_is_paid'))
    } else if (paidSubscriptions.length > 1) {
      // Weird edge case, maybe 2 invoices were generated and paid for?
      // Just issue a message like above, but log this
      console.warn(`User ${user.id} was found to have ${paidSubscriptions.length} paid and current subscriptions`)
      return await ctx.reply(ctx.t('subscription_is_paid'))
    }
    try {
      const subscription = await db.createSubscription(
        user.id,
        days * 60 * 60 * 24
      )
      const amount = SubscriptionCosts.calculateCost(days)
      await createPayment(user, amount, subscription, ctx)
    } catch(err) {
      console.error('error: ', err)
    }
  }
}

const handleInfo = async (ctx: BotContext) => ctx.reply(ctx.t('info'))

const handleAbout = async (ctx: BotContext) => {
  const version: string = process.env.npm_package_version ?
    process.env.npm_package_version : '?.?.?'
  const transationContext = { version }
  ctx.reply(ctx.t('about', transationContext))
}

main()