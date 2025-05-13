import type { InitialPaymentFailedEmailData } from '../../../types/emailTemplates' // Assuming this type will be added
import { generateBaseEmailLayout } from '../baseLayout'

export const generateInitialPaymentFailedEmail = (
  data: InitialPaymentFailedEmailData,
): string => {
  const { userName, orderNumber, failureReason, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Проблема с оплатой заказа #${orderNumber}`
      : `Issue with Your Order Payment #${orderNumber}`

  const reasonText = failureReason
    ? (locale === 'ru' ? `Причина: ${failureReason}` : `Reason: ${failureReason}`)
    : (locale === 'ru' ? 'Пожалуйста, проверьте ваши платежные данные и попробуйте снова или свяжитесь с поддержкой.' : 'Please check your payment details and try again, or contact support.')

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `К сожалению, не удалось обработать платеж для вашего заказа <strong>#${orderNumber}</strong>.` : `Unfortunately, we were unable to process the payment for your order <strong>#${orderNumber}</strong>.`}
    </p>
    <p>${reasonText}</p>
    <p>
      ${locale === 'ru' ? 'Вы можете попробовать оплатить заказ снова из вашего личного кабинета:' : 'You can attempt to pay for your order again from your account area:'}
      <a href="${siteUrl}/account/orders/${orderNumber}" class="button">${locale === 'ru' ? 'Попробовать снова' : 'Try Again'}</a>
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}