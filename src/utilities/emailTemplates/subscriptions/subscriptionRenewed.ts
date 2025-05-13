import type { SubscriptionRenewedSuccessfullyEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionRenewedEmail = (
  data: SubscriptionRenewedSuccessfullyEmailData,
): string => {
  const { userName, planName, newExpiryDate, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваша подписка на ${planName} успешно продлена`
      : `Your Subscription to ${planName} Has Been Successfully Renewed`

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Ваша подписка на тарифный план <strong>${planName}</strong> была успешно продлена.` : `Your subscription to the <strong>${planName}</strong> plan has been successfully renewed.`}
    </p>
    <p>
      ${locale === 'ru' ? `Новая дата окончания подписки:` : `Your new subscription expiry date is:`} ${new Date(newExpiryDate).toLocaleDateString(locale)}.
    </p>
    <p>
      ${locale === 'ru' ? 'Спасибо, что остаетесь с нами!' : 'Thank you for being a valued customer!'}
    </p>
    <p>
      <a href="${siteUrl}/account/subscriptions">${locale === 'ru' ? 'Перейти к моим подпискам' : 'Go to My Subscriptions'}</a>
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}