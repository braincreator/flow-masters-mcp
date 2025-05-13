import type { OrderCancelledEmailData } from '../../../types/emailTemplates' // Assuming this type will be added
import { generateBaseEmailLayout } from '../baseLayout'

export const generateOrderCancelledEmail = (
  data: OrderCancelledEmailData,
): string => {
  const { userName, orderNumber, cancellationReason, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваш заказ #${orderNumber} был отменен`
      : `Your Order #${orderNumber} Has Been Cancelled`

  const reasonText = cancellationReason
    ? (locale === 'ru' ? `Причина отмены: ${cancellationReason}` : `Reason for cancellation: ${cancellationReason}`)
    : (locale === 'ru' ? 'Если у вас есть вопросы, пожалуйста, свяжитесь с нашей службой поддержки.' : 'If you have any questions, please contact our support team.')


  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Сообщаем вам, что ваш заказ <strong>#${orderNumber}</strong> был отменен.` : `This email confirms that your order <strong>#${orderNumber}</strong> has been cancelled.`}
    </p>
    <p>${reasonText}</p>
    <p>
      ${locale === 'ru' ? 'Если отмена произошла по ошибке или вы хотите разместить новый заказ, пожалуйста, посетите наш сайт:' : 'If this cancellation was made in error, or if you would like to place a new order, please visit our website:'}
      <a href="${siteUrl}">${siteUrl}</a>
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}