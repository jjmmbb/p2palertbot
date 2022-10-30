import * as dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'

const BOT_TOKEN = process.env.BOT_TOKEN

const main = async () => {
  if (BOT_TOKEN === undefined) {
    console.log('BOT_TOKEN undefined')
    return
  }
  const bot = new Telegraf(BOT_TOKEN)
  bot.start(ctx => ctx.reply('Welcome!'))
  bot.help((ctx) => ctx.reply('Send me a sticker'))
  bot.command('addalert', ctx => ctx.reply('add alert selected!'))
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