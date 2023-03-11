# Arturito Bot
> A bot that will notify you of good trades at <a href="https://lnp2pbot.com/">lnp2pbot</a>.

[![chat][telegram-image]](https://t.me/lnp2palertbot)
[![MIT license][mit-url]](./LICENSE)


The whole idea behind this bot is for it to be able to notify you of potentially attractive trade opportunities.

![Arturito Bot](https://i.imgur.com/kay8wvn.jpeg)

## Installation

Clone repo
```sh
git clone https://github.com/bilthon/p2palertbot.git
```

Enter directory and install dependencies
```
cd p2palertbot
npm install
```

Edit the configuration (see below) and run!
```
npm start
```

## Configuration

To run this bot you will need to create a bot with the <a href="https://telegram.me/BotFather">Bot Father</a>, reguster a new bot and get its authentication token. This along with some other secret information should entered in your `.env` file.  

```
BOT_TOKEN=<your_bot_token>
LNP2PBOT_BASE_URL=http://api.lnp2pbot.com
LNBITS_BASE_URL=https://legend.lnbits.com
LNBITS_READ_KEY=<your_lnbits_wallet_api_key>
WEBHOOK_PORT=3005
WEBHOOK_URL=<your_host_name_or_ip>
DATABASE_URL=<your_db_url>
```

## Usage
The most important command is `addalert`. An alert will be created no matter what, but for it to be executed you need a valid subscription.

Let's say I want to be informed of sell orders in euros with a discount of 5 or more.
```
/addalert eur -5 sell
```

For your alert to be dispatched however, you'll need an active subscription. To generate a subscription for 10 days you'll do:

```
subscribe 10
```

This will reply with a Lightning invoice, that once paid will give you a subscription of 10 days. Once you have an active subscriptions you can add as many alerts as you want.


## Contact

<img src="https://user-images.githubusercontent.com/99301796/219741736-3ce00069-9c6a-47f2-9c8b-108f3f40295b.png" alt="Nostr logo" width="15"/>
Nostr - @npub1qqqqqzwwsdha2f5fvel4gtj02rgnw9syyuv4hqywg8unucgc9e3qxsll4h<br><br>

Distributed under the MIT license. See ``LICENSE`` for more information.

<!-- Markdown link & img dfn's -->
[telegram-image]: https://img.shields.io/badge/chat-telegram-%2326A5E4
[mit-url]: https://img.shields.io/badge/license-MIT-brightgreen
