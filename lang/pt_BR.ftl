welcome = Bem-vindo(a) novo(a) usuário(a)!
welcome_back = Bem-vindo(a) de volta, usuário(a) conhecido(a)!
no_bots = Desculpe, não atendemos bots aqui
help = Oracle permitirá que você configure alertas automáticos para oportunidades de negociação que possa achar interessantes
edit_alert_placeholder = Método não implementado, por enquanto você pode apenas repetir o addalert
not_introduced = Isso é estranho, parece que ainda não fomos apresentados!
start_prompt = Por favor, digite <code>/start</code>
addalert_invalid_argument = Argumentos inválidos, espera-se: /addalert <moeda> <variação_preço> <tipo_ordem>
addalert_sample_l1= Ex: /addalert BRL 5 BUY
addalert_sample_l2 = ☝️ Configura um alerta para ordens de compra com mais de 5% de prêmio
invalid_premium_or_discount = <Prêmio/desconto> inválido, esperando um número positivo ou negativo
invalid_currency = Valor de <moeda> inválido, espera-se o nome de uma moeda. Ex. USD, EUR, BRL, etc.
invalid_order_type = <tipo_ordem> inválido. Deve ser BUY ou SELL
addalert_error = Erro ao tentar adicionar/atualizar alerta
above = acima
below = abaixo
buy = comprar
sell = vender
addalert_success = 👍 Perfeito! Avisarei você sempre que uma ordem de { $orderType } em { $currency } com preço { $position } { $priceDelta }% for postada.
alert_list_title = <b>**Lista de alertas programados**</b>
alert_list_item = <b>{ $id })</b> { $flag } { $orderType }, { $priceDelta }% { $direction } preço de mercado, em { $currency }
no_alerts_to_remove = Você não tinha alertas para remover
alert_removed_single = Um alerta foi removido
alert_removed_multiple = { $count } alertas foram removidos
error_cancel_alert_invalid_argument = Argumentos inválidos, espera-se: /cancelalert <alert_id>
error_cancel_alert_ex = Ex: /cancelalert 2
error_cancel_alert_suggestion = Você pode encontrar todos os IDs de alerta com /listalerts
error_cancel_alert_invalid_id = ID de alerta inválido
cancel_alert_success = Alerta com ID { $alertId } removido
error_cancel_alert = Não foi possível remover, nenhum alerta encontrado com ID { $alertId }
error_invoice_generation = Erro ao tentar gerar uma fatura
error_invalid_invoice = Erro: fatura inválida retornada pelo provedor, não é possível continuar
error_payment_creation = Erro desconhecido no procedimento de criação de pagamento
pay_invoice_prompt = Por favor, pague a seguinte fatura:
unexpected_result_payment_creation = Resultado inesperado ao tentar criar pagamento
error_unexpected_response_code_create_invoice = Código de resposta inesperado ao tentar criar uma fatura
subscription_is_paid = Sua assinatura está ativa e paga
pending_ivoice_exists = Usuário tem { $count } pagamentos pendentes, isso não deveria acontecer
multiple_active_subscriptions = Usuário possui várias assinaturas ativas não pagas, isso não deveria acontecer
wrong_duration = Valor [duration] incorreto. A duração deve ser especificada em número de dias
payment_detected = Ótimo! Pagamento detectado! Sua assinatura agora está ativa 😃
alert_added_without_subscription = O alerta foi criado, mas só será entregue após o pagamento de uma assinatura
alert_added_without_active_subscription = O alerta foi criado, mas sua assinatura expirou! Por favor, renove-a para receber as notificações. Basta digitar /subscribe e pagar a fatura
alert_added_without_paid_subscription = O alerta foi criado, mas sua assinatura ainda não foi paga! Por favor, pague a fatura para receber as notificações. Se você perdeu a fatura, pode obter uma nova digitando /subscribe
info = <b>Assinaturas:</b> { $subscriptionCount }, ({ $activeCount } ativas)
  <b>Total pago:</b> { $totalPaid } sats
  <b>Total de alertas:</b> { $alertsCount }
about = Oracle Bot v { $version }.

  O Bot Oracle trabalha em conjunto com o LNP2PBot, permitindo que você seja notificado sempre que surgir uma oportunidade de negociação interessante. Suponha que alguém precise urgentemente de dinheiro e decida vender alguns sats. Para vender mais rápido, é muito provável que essa pessoa esteja disposta a oferecer um desconto no preço. No entanto, essa é apenas parte da história, pois para que essa negociação seja concluída rapidamente, os compradores potenciais devem idealmente ser notificados dessa venda com desconto. Certamente, todas as novas ordens são publicadas no canal principal ou dentro das comunidades, mas não seria melhor se você pudesse receber apenas notificações especialmente personalizadas para ofertas de negociação que realmente interessam a você? Bem, é isso que o Oracle faz. Você descreve para ele como é uma ordem atraente para você, e ele informará quando algo assim for publicado.
help_subscription = Você deve especificar uma duração de assinatura por dia.
  Ex: <code>/subscribe 10</code> para uma assinatura de 10 dias.
  O custo por dia é de { $costPerDay } sats
