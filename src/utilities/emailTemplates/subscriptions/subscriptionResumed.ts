import type { SubscriptionResumedEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionResumedEmail = (
  data: SubscriptionResumedEmailData,
): string => {
  const { userName, planName, resumedAt, nextPaymentDate, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваша подписка на ${planName} возобновлена`
      : `Your Subscription to ${planName} Has Been Resumed`

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Ваша подписка на тарифный план <strong>${planName}</strong> была успешно возобновлена с ${new Date(resumedAt).toLocaleDateString(locale)}.` : `Your subscription to the <strong>${planName}</strong> plan has been successfully resumed effective ${new Date(resumedAt).toLocaleDateString(locale)}.`}
    </p>
    <p>
      ${locale === 'ru' ? `Следующее списание средств произойдет ${new Date(nextPaymentDate).toLocaleDateString(locale)}.` : `Your next payment will be on ${new Date(nextPaymentDate).toLocaleDateString(locale)}.`}
    </p>
    <p>
      ${locale === 'ru' ? 'Вы можете управлять вашей подпиской в личном кабинете:' : 'You can manage your subscription in your account area:'}
      <a href="${siteUrl}/account/subscriptions">${siteUrl}/account/subscriptions</a>
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}