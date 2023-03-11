welcome = Bienvenido usuario nuevo!
welcome_back = Bienvenido de vuelta!
no_bots = Perdona, pero no aceptamos bots aqui
help = Arturito te va a ayudar a colocar alertas automáticos que te avisen de oportunidades de compra y venta que te puedan parecer atractivas.
edit_alert_placeholder = Metodo no implementado. Por ahora, puedes usar el addalert con la misma moneda y tipo de órden, el resultado será el mismo.
not_introduced = Vaya esto es raro, parece que no nos han presentado aun!
start_prompt = Por favor escribe <code>/start</code>
addalert_invalid_argument = Argumentos inválidos, forma esperada: /addalert <moneda> <variacion_de_precio> <tipo_de_orden>
addalert_sample_l1= Ej: /addalert USD 5 BUY
addalert_sample_l2 = ☝️ Te crea un alerta para ordenes de compra con mas de 5% de prima
invalid_premium_or_discount = Valor inválido para la <prima/descuento>, esperaba un valor numérico, positivo o negativo.
invalid_currency = Valor inválido para <moneda>, esperaba un código de moneda. Ej: USD, EUR, etc. Mayúsculas o minúsculas, no importa.
invalid_order_type = Valor inválido para <tipo_de_orden>. Tiene que ser BUY o SELL. Mayúsculas o minúsculas, no importa.
addalert_error = Error al tratar de agregar un alerta
above = encima de
below = debajo de
buy = compra
sell = venta
addalert_success = 👍 Perfecto! Te avisare cuando haya una orden de { $orderType } en la moneda { $currency } con un precio { $position } { $priceDelta }%
alert_list_title = <b>**Lista de alertas programadas**</b>
alert_list_item = <b>{ $id })</b> { $flag } { $orderType }, { $priceDelta }% { $direction }, en { $currency }
no_alerts_to_remove = No tienes alertas para eliminar
alert_removed_single = Un alerta fue eliminado
alert_removed_multiple = Se eliminaron { $count } alertas
error_cancel_alert_invalid_argument = Argumentos inválidos, se espera: /cancelalert <id_de_alerta>
error_cancel_alert_ex = Ej: /cancelalert 2
error_cancel_alert_suggestion = Puedes encontrar todos los ids de alertas con /listalerts
error_cancel_alert_invalid_id = Id de alerta inválido
cancel_alert_success = Se eliminó alerta con id { $alertId }
error_cancel_alert = No se pudo eliminar alerta, no se encontro ninguno con el id { $alertId }
error_invoice_generation = Error al tratar de generar un recibo
error_invalid_invoice = Error: se obtuvo un recibo lightning inválido del proveedor, no se puede proceder
error_payment_creation = Error desconocido en el procedimiento de generar pago
pay_invoice_prompt = Por favor pague el siguiente recibo lightning: 
unexpected_result_payment_creation = Resultado inesperado al tratar de crear un pago
error_unexpected_response_code_create_invoice = Respuesta inesperada al tratar de crear un recibo lightning
subscription_is_paid = Usted ya cuenta con una subscripción activa y pagada
pending_ivoice_exists = El usuario tiene { $count } pagos pendientes, esto no debería suceder
multiple_active_subscriptions = El usuario tiene variqas subscripciones activas pero no pagadas, esto no debería suceder
wrong_duration = Valor inválido para el campo [duración]. El campo es opcional, pero si se use tiene que ser un valor numérico indicando la cantidad de días.
payment_detected = Genial! el pago fue registrado! Tu suscripción ahora está activa 😃
alert_added_without_subscription = ⚠️ El alerta fue creado, pero solo recibiras notificaciones una vez que se haya pagado por la suscripción 😥
alert_added_without_active_subscription = El alerta fue creado, pero tu suscripción está vencida! 😥 Por favor renuevala para que las notificaciones se puedan entregar. Solo tienes que escribir /subscribe y pagar el invoice
alert_added_without_paid_subscription = El alerta fue creado, pero tu suscripción no está pagada! Por favor paga el recibo lightning para poder entregarte las notificaciones. Si lo has perdido puedes obtener uno nuevo con el comando /subscribe
info = <b>Suscripciones:</b> { $subscriptionCount }, ({ $activeCount } active)
  <b>Total pagado:</b> { $totalPaid } sats
  <b>Alertas:</b> { $alertsCount }
about = Arturito Bot v{ $version }.

  El Bot Arturito funciona en conjunto con el LNP2PBot, su propósito es permitirle recibir una notificación cada vez que se presente una oportunidad de intercambio interesante. Supongamos que alguien tiene una gran necesidad de efectivo y decide que necesita vender algunos sats. Para que esta persona venda más rápido, es muy probable que esté dispuesta a ofrecer un descuento en el precio. Sin embargo, eso es solo parte de la historia, ya que para que esta transacción se complete rápidamente, lo ideal sería que los compradores potenciales fueran notificados de esta venta con un descuento. Actualmente todos los pedidos nuevos se publican en el canal principal o dentro de las comunidades, pero ¿no sería mejor si pudiera recibir solo notificaciones especialmente diseñadas para las ofertas comerciales que realmente te interesan? Pues esto es lo que hace Arturito. Tu le describes cómo se ve un pedido atractivo para ti y el te avisará cuando se publique algo así.

  Este Bot se encuentra en alfa, por favor reportar cualquier bug al creador @bilthon
help_subscription = Tienes que especificar la duración en días de la suscripción.
  Ej: <code>/subscribe 10</code> te crea una suscripción por 10 días.
  El costo por día es { $costPerDay } satoshis.