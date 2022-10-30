import * as dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import { Database } from './db'

const BOT_TOKEN = process.env.BOT_TOKEN

const main = async () => {
  if (BOT_TOKEN === undefined) {
    console.log('BOT_TOKEN undefined')
    return
  }
  const db = new Database()
  const bot = new Telegraf(BOT_TOKEN)
  bot.start(async (ctx) => {
    const { update: { message: { from: { id, is_bot } } } } = ctx
    const telegramId = BigInt(id)
    const user = await db.findUser(telegramId)
    if (is_bot) {
      return ctx.reply('Sorry, we do not serve bots here')
    }
    if (!user) {
      await db.addUser(telegramId)
      return ctx.reply('Welcome new user!')
    }
    ctx.reply('Welcome back known user!')
  })
  bot.help(
    ctx => ctx.reply('P2P alert bot will allow you to set automated alerts to trading opportunities you might find interesting')
  )
  bot.command('addalert', ctx => {
    ctx.reply('add alert selected!')
  })
  bot.command('listalerts', ctx => ctx.reply('list alerts selected!'))
  bot.command('editalert', ctx => ctx.reply('edit alert selected!'))
  bot.command('cancelalert', ctx => ctx.reply('cancel alert selected!'))
  bot.command('cancelall', ctx => ctx.reply('cancel all alerts selected!'))

  try {
    await bot.launch()
  } catch(e) {
    console.error('error: ', e)
  }

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

main()