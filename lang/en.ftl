welcome = Welcome new user!
welcome_back = Welcome back known user!
no_bots = Sorry, we do not serve bots here
help = Oracle will allow you to set automated alerts to trading opportunities you might find interesting
edit_alert_placeholder = Method not implemented, for now you can just repeat the addalert
not_introduced = This is weird, it seems we have not been introduced yet!
start_prompt = Please type <code>/start</code>
addalert_invalid_argument = Invalid arguments, expects: /addalert <currency> <price_delta> <order_type>
addalert_sample_l1= Ex: /addalert USD 5 BUY
addalert_sample_l2 = ☝️ Sets an alert for buy orders with more than 5% of premium
invalid_premium_or_discount = Invalid <premium/discount>, expecting a positive or negative number
invalid_currency = Invalid <currency> value, expects a currency name. Ex. USD, EUR, etc
invalid_order_type = Invalid <order_type>. Must be either BUY or SELL
addalert_error = Error while trying to add/update alert
above = above
below = below
buy = buy
sell = sell
addalert_success = 👍 Perfect! I'll let you know whenever a { $orderType } order on { $currency } with price { $position } { $priceDelta }% is posted.
alert_list_title = <b>**List of programmed alerts**</b>
alert_list_item = <b>{ $id })</b> { $flag } { $orderType }, { $priceDelta }% { $direction } market price, in { $currency }
no_alerts_to_remove = You had no alerts to remove
alert_removed_single = One alert was removed
alert_removed_multiple = { $count } alerts were removed
error_cancel_alert_invalid_argument = Invalid arguments, expects: /cancelalert <alert_id>
error_cancel_alert_ex = Ex: /cancelalert 2
error_cancel_alert_suggestion = You can find all alert ids with /listalerts
error_cancel_alert_invalid_id = Invalid alert id
cancel_alert_success = Removed alert with id { $alertId }
error_cancel_alert = Could not remove, no alert was found with id { $alertId }
error_invoice_generation = Error while trying to generate an invoice
error_invalid_invoice = Error: invalid invoice returned by provider, cannot proceed
error_payment_creation = Unknown error in the payment creation procedure
pay_invoice_prompt = Please pay the following invoice: 
unexpected_result_payment_creation = Unexpected result when trying to create payment
error_unexpected_response_code_create_invoice = Unexpected response code when trying to create an invoice
subscription_is_paid = Your subscription is active and paid
pending_ivoice_exists = User has { $count } pending payments, this should not happen
multiple_active_subscriptions = User has multiple active unpaid subscriptions, this should not happen
wrong_duration = Wrong [duration] value. A duration must be specified in number of days
payment_detected = Great! payment detected! Your subscription is now active 😃
alert_added_without_subscription = The alert was created, but it will only be delivered once a subscription payment is made
alert_added_without_active_subscription = The alert was created, but your subscription has expired! Please renew it in order to get notifications delivered. You just need to type /subscribe and pay the invoice
alert_added_without_paid_subscription = The alert was created, but your subscription is not yet paid for! Please pay the invoice in order to get notifications delivered. If you lost the invoice you can get a new one by typing /subscribe
info = <b>Subscriptions:</b> { $subscriptionCount }, ({ $activeCount } active)
  <b>Total paid:</b> { $totalPaid } sats
  <b>Total alerts:</b> { $alertsCount }
about = Oracle Bot v { $version }.

  The Oracle Bot works in tandem with the LNP2PBot, its purpose is to allow you to get notified whenever an interesting trade opportunity takes place. Suppose someone is in dire need of cash and decides he/she needs to sell some sats. In order for this person to sell faster, it's very likely that he/she will be willing to offer a discount in price. That however is just part of the story, as in order for this trade to be completed quickly potential buyers should ideally be notified of this sell at a discount. Sure, all new orders are published in the main channel or within the communities, but wouldn't it be better if you could receive only specially tailored notifications for trade offers you're actually interested in? Well this is what Oracle does. You describe to it what an attractive order looks like for you, and it will let you know when something like that is published.
help_subscription = You must specify a subscription duration per day.
  Ex: <code>/subscribe 10</code> for a 10 day subscription.
  The cost per day is { $costPerDay } sats
