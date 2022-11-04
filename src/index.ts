import * as dotenv from 'dotenv'
dotenv.config()
import axios, { AxiosInstance } from 'axios'
import { OrderType, User } from '@prisma/client'
import { Context, Telegraf, NarrowedContext } from 'telegraf'
import { Update } from 'typegram/update'
import { Database } from './db'
import { OrdersUpdater, OnNotificationEvent, Order } from './orders-updater'

const BOT_TOKEN = process.env.BOT_TOKEN
const CURRENCIES = [
  'USD',
  'EUR',
  'ARS',
  'USDT',
  'MXN',
  'CLP',
  'COL',
  'BTL',
  'VES'
]

const ORDER_TYPES = ['BUY', 'SELL']

const db = new Database()

const http = axios.create({
  baseURL: process.env.LNP2PBOT_BASE_URL
})

const main = async () => {
  if (BOT_TOKEN === undefined) {
    console.log('BOT_TOKEN undefined')
    return
  }
  const bot = new Telegraf(BOT_TOKEN)
  bot.start(async (ctx) => {
    ctx.update.message.chat.id
    const { update: { message: { chat , from: { id, is_bot } } } } = ctx
    const telegramId = BigInt(id)
    const chatId = BigInt(chat.id)
    const user = await db.findUserByTelegramId(telegramId)
    if (is_bot) {
      return ctx.reply('Sorry, we do not serve bots here')
    }
    if (!user) {
      await db.addUser(telegramId, chatId)
      return ctx.reply('Welcome new user!')
    }
    ctx.reply('Welcome back known user!')
  })
  bot.help(
    ctx => ctx.reply('P2P alert bot will allow you to set automated alerts to trading opportunities you might find interesting')
  )
  bot.command('addalert', async (ctx) => {
    const { update: { message: { text, entities }}} = ctx
    handleAddAlert(ctx, text.split(' '))
  })
  bot.command('listalerts', ctx => handleListAlerts(ctx))
  bot.command('editalert', ctx => ctx.reply('edit alert selected!'))
  bot.command('cancelalert', ctx => {
    const { update: { message: { text } } } = ctx
    handleCancelAlert(ctx, text.split(' '))
  })
  bot.command('cancelall', ctx => handleCancelAll(ctx))

  try {
    await bot.launch()
  } catch(e) {
    console.error('error: ', e)
  }

  const onNotification: OnNotificationEvent = (
    userId: number,
    alertId: number,
    order: Order,
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await db.findUserById(userId)
        if (user && bot.telegram) {
          let msg = `${order.description}\n`
          // PoC: Commented for now because I want to make this more efficient by storing
          // communities in the database.
          // let channel = ''
          // if (order.community_id) {
          //   const resp = await http.get(`/community/${order.community_id}`)
          //   const { data } = resp
          //   channel = data.group.split('@')[1]
          // } else {
          //   channel = 'p2plightning'
          // }
          // const url = `https://t.me/${channel}/${order.tg_channel_message1}`
          // if (url !== '') {
          //   msg += `<a href="${url}">${order._id}</a>\n`
          // } else {
          //   msg += `<i>${order._id}</i>\n`
          // }
          await bot.telegram.sendMessage(user.chatId.toString(), msg, {parse_mode: 'HTML'})
          await db.addDelivery(userId, alertId, order._id)
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

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

const getUser = async (
  ctx: NarrowedContext<Context, Update.MessageUpdate>
) : Promise<User | null> => {
  const { update: { message: { from: { id } } } } = ctx
  const user = await db.findUserByTelegramId(BigInt(id))
  if (!user) {
    await ctx.reply('This is weird, it seems we have not been introduced yet!')
    await ctx.reply('Please type /start')
  }
  return user
}

const handleAddAlert = async (
  ctx: NarrowedContext<Context, Update.MessageUpdate>,
  args: string[]
) => {
  if (args.length !== 4) {
    await ctx.reply('Invalid arguments, expects: /addalert <currency> <price_delta> <order_type>')
    await ctx.reply('Ex: /addalert USD 5 BUY')
    return await ctx.reply('☝️ Sets an alert for buy orders with more than 5% of premium')
  }
  const [cmd, currency, priceDeltaStr, orderTypeStr] = args
  const priceDelta = parseFloat(priceDeltaStr)
  if (priceDelta === NaN) {
    return ctx.reply(
      'Invalid <premium/discount>, expecting a positive or negative number'
    )
  }
  if (!CURRENCIES.find(c => c.toLowerCase() === currency.toLowerCase())) {
    return ctx.reply('Invalid <currency> value, expects a currency name. Ex. USD, EUR, etc')
  }
  if (!ORDER_TYPES.find(o => o.toLowerCase() === orderTypeStr.toLowerCase())) {
    return ctx.reply('Invalid <order_type>. Must be either BUY or SELL')
  }
  const { update: { message: { from: { id } } } } = ctx
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
    console.error('Error while trying to add/update alert: ', err)
    return await ctx.reply('Error while trying to add/update alert')
  }
  const position = orderType === OrderType.BUY ? 'above' : 'below'
  ctx.reply(`Perfect! I\'ll let you know whenever a ${orderType} order on ${currency} with price ${position} ${priceDelta}% is posted`)
}

const handleListAlerts = async (
  ctx: NarrowedContext<Context, Update.MessageUpdate>
) => {
  const user = await getUser(ctx)
  if (user) {
    const alerts = await db.findAlertsByUser(user.id)
    let list = ' <b>**List of programmed alerts**</b> \n'
    for(const alert of alerts) {
      const { id, currency, priceDelta, orderType } = alert
      const flag = orderType === OrderType.BUY ? '🟢' : '🔴'
      const direction = orderType === OrderType.BUY ? '⬆️': '⬇️'
      const line = `<b>${id})</b> ${flag} ${orderType.toUpperCase()}, ${direction} ${priceDelta}% market price, in ${currency.toUpperCase()}\n`
      list += line
    }
    ctx.replyWithHTML(list)
  }
}

const handleCancelAll = async (
  ctx: NarrowedContext<Context, Update.MessageUpdate>
) => {
  const user = await getUser(ctx)
  if (user) {
    const { count } = await db.removeAllAlerts(user.id)
    if (count === 0) return await ctx.reply('You had no alerts to remove')
    const msg = count === 1 ?
      'One alert was removed' : `${count} alerts were removed`
    await ctx.reply(msg)
  }
}

const handleCancelAlert = async (
  ctx: NarrowedContext<Context, Update.MessageUpdate>,
  args: string[]
) => {
  const user = await getUser(ctx)
  if (user) {
    if (args.length !== 2) {
      await ctx.reply('Invalid arguments, expects: /cancelalert <alert_id>')
      await ctx.reply('Ex: /addalert 2')
      return await ctx.reply('You can find all alert ids with /listalerts')
    }
  }
  const [ cmd, alertIdStr ] = args
  const alertId = parseInt(alertIdStr)
  if (alertId === NaN) {
    return await ctx.reply('Invalid alert id')
  }
  let alert = db.findAlertById(alertId)
  try {
    if (alert !== null) {
      await db.removeAlertById(alertId)
      return await ctx.reply(`Removed alert with id ${alertId}`)
    } else {
      return await ctx.reply(
        `Could not remove, no alert was found with id ${alertId}`
      )
    }
  } catch(err) {
    console.error('Error while removing alert. err: ', err)
  }
}

main()