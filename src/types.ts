import { Context, NarrowedContext } from 'telegraf'
import { Update } from 'typegram/update'
import { I18nFlavor } from '@grammyjs/i18n'

export type BotContext = NarrowedContext<Context, Update.MessageUpdate> & I18nFlavor