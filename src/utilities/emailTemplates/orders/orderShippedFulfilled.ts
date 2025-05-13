import type { OrderShippedFulfilledEmailData } from '../../../types/emailTemplates' // Assuming this type will be added
import { generateBaseEmailLayout } from '../baseLayout'

export const generateOrderShippedFulfilledEmail = (
  data: OrderShippedFulfilledEmailData,
): string => {
  const { userName, orderNumber, shippedAt, trackingNumber, carrier, items, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваш заказ #${orderNumber} отправлен/выполнен`
      : `Your Order #${orderNumber} Has Been Shipped/Fulfilled`

  let itemsHtml = '<ul>'
  if (items && items.length > 0) {
    items.forEach((item: NonNullable<OrderShippedFulfilledEmailData['items']>[number]) => {
      itemsHtml += `<li>${item.name} (x${item.quantity})</li>`
    })
  }
  itemsHtml += '</ul>'

  let trackingInfo = ''
  if (trackingNumber && carrier) {
    trackingInfo = locale === 'ru'
      ? `<p>Вы можете отследить ваш заказ: Перевозчик - ${carrier}, Трек-номер - ${trackingNumber}.</p>`
      : `<p>You can track your order: Carrier - ${carrier}, Tracking Number - ${trackingNumber}.</p>`
  } else if (trackingNumber) {
    trackingInfo = locale === 'ru'
      ? `<p>Трек-номер для отслеживания: ${trackingNumber}.</p>`
      : `<p>Tracking Number: ${trackingNumber}.</p>`
  }


  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Рады сообщить, что ваш заказ <strong>#${orderNumber}</strong>${shippedAt ? ` от ${new Date(shippedAt).toLocaleDateString(locale)} ` : ' '}был отправлен или выполнен.` : `We're pleased to inform you that your order <strong>#${orderNumber}</strong>${shippedAt ? ` placed on ${new Date(shippedAt).toLocaleDateString(locale)} ` : ' '}has been shipped or fulfilled.`}
    </p>
    <p>${locale === 'ru' ? 'Состав заказа:' : 'Order Contents:'}</p>
    ${itemsHtml}
    ${trackingInfo}
    <p>
      ${locale === 'ru' ? 'Вы можете просмотреть детали вашего заказа в вашем личном кабинете:' : 'You can view your order details in your account area:'}
      <a href="${siteUrl}/account/orders/${orderNumber}">${siteUrl}/account/orders/${orderNumber}</a>
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}