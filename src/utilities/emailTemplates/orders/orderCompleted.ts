import type { OrderCompletedEmailData } from '../../../types/emailTemplates' // Assuming this type will be added
import { generateBaseEmailLayout } from '../baseLayout'

export const generateOrderCompletedEmail = (
  data: OrderCompletedEmailData,
): string => {
  const { userName, orderNumber, orderDate, items, siteUrl, locale = 'ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваш заказ #${orderNumber} выполнен`
      : `Your Order #${orderNumber} is Completed`

  let itemsHtml = '<ul>'
  if (items && items.length > 0) {
    items.forEach((item: NonNullable<OrderCompletedEmailData['items']>[number]) => {
      itemsHtml += `<li>${item.name} (x${item.quantity})</li>`
    })
  } else {
    itemsHtml += `<li>${locale === 'ru' ? 'Детали заказа доступны в вашем аккаунте.' : 'Order details are available in your account.'}</li>`
  }
  itemsHtml += '</ul>'

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Ваш заказ <strong>#${orderNumber}</strong> от ${new Date(orderDate).toLocaleDateString(locale)} был успешно выполнен.` : `Your order <strong>#${orderNumber}</strong> placed on ${new Date(orderDate).toLocaleDateString(locale)} has been successfully completed.`}
    </p>
    <p>${locale === 'ru' ? 'Состав заказа:' : 'Order Contents:'}</p>
    ${itemsHtml}
    <p>
      ${locale === 'ru' ? 'Вы можете просмотреть детали вашего заказа и получить доступ к приобретенным цифровым товарам или услугам в вашем личном кабинете:' : 'You can view your order details and access your purchased digital goods or services in your account area:'}
      <a href="${siteUrl}/account/orders/${orderNumber}">${siteUrl}/account/orders/${orderNumber}</a>
    </p>
    <p>
      ${locale === 'ru' ? 'Спасибо за ваш заказ!' : 'Thank you for your order!'}
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}