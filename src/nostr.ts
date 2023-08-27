const { RelayPool } = require('nostr')
// @ts-ignore
import { getBlankEvent, Kind, finishEvent, nip19 } from 'nostr-tools'
import { Order } from './orders-updater'
import { logger } from './logger'

/**
 * This class is responsible for generating nostr events,
 * once a new order is found
 */
export class NostrNotifier {
  private nsec: string | undefined
  private pool: any
  constructor() {
    this.nsec = process.env.NOSTR_PRIVATE_KEY
    const relays = this._getRelays()
    if (relays && relays.length > 0) {
      this.pool = new RelayPool(relays)
      this.pool.on('open', (relay: any) => {
        logger.info(`🔌 connected to relay: ${relay.url}`)
      })
      this.pool.on('ok', async (relay: any, id: string, accepted: boolean, msg: string) => {
        msg = `📡 got an ok event. id: ${id}, accepted: ${accepted}, relay: ${relay.url}, msg: ${msg}`
        if (accepted)
          logger.info(msg)
        else
          logger.warning(msg)
      })
    }
  }

  private _getRelays() {
    if (process.env.RELAYS) {
      return process.env.RELAYS.split(',')
    }
    return []
  }

  public async notify(order: Order) {
    if (!this.nsec) {
      logger.error('No NOSTR_PRIVATE_KEY found in env')
      return
    }
    if (!this.pool) {
      logger.error('Missing relays')
      return
    }
    const privateKey = nip19.decode(this.nsec).data as string
    logger.info(`Notifying about order: ${order._id}`)
    const event = getBlankEvent<Kind.Text>(1)
    event.created_at = Math.floor(Date.now() / 1000)
    event.content = order.description
    const signedEvent = finishEvent(event, privateKey)
    logger.debug(signedEvent)

    await this.pool.send(['EVENT', signedEvent])
  }
}