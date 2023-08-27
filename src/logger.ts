import * as winston from 'winston'
const { combine, timestamp, colorize, cli, ms, printf } = winston.format;

/**
 * syslog levels
 *
 {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}
*/

const colors = {
  emerg: 'red',
  alert: 'red',
  crit: 'red',
  error: 'red',
  warning: 'yellow',
  notice: 'green',
  info: 'blue',
  debug: 'magenta'
}

export const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL_CLI || 'info',
      format: combine(
        colorize({ all: true }),
        ms(),
        timestamp(),
        cli({ colors, all: true }),
        printf((info) => {
          const msg = info.message.replace('undefined', '')
          return `[${info.timestamp}] ${info.level}:${msg} [${info.ms}]`
        })
      )
    }),
    new winston.transports.File({
      filename: 'arturito.log',
      level: process.env.LOG_LEVEL_FILE || 'debug',
      format: combine(
        timestamp(),
        printf((info) => `[${info.timestamp}] ${info.level}:${info.message}`)
      )
    })
  ]
})

export const testLogger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL_CLI || 'info',
      format: combine(
        colorize({ all: true }),
        timestamp(),
        cli(),
        printf((info) => `[${info.timestamp}] ${info.level}:${info.message}`)
      )
    })
  ]
})