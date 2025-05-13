import type { SubscriptionPausedEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionPausedEmail = (
  data: SubscriptionPausedEmailData,
): string => {
  const { userName, planName, pausedAt, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваша подписка на ${planName} приостановлена`
      : `Your Subscription to ${planName} Has Been Paused`

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Ваша подписка на тарифный план <strong>${planName}</strong> была приостановлена с ${new Date(pausedAt).toLocaleDateString(locale)}.` : `Your subscription to the <strong>${planName}</strong> plan has been paused effective ${new Date(pausedAt).toLocaleDateString(locale)}.`}
    </p>
    <p>
      ${locale === 'ru' ? 'Во время паузы списания производиться не будут, и доступ к функциям тарифного плана может быть ограничен.' : 'During the pause, you will not be billed, and access to plan features may be limited.'}
    </p>
    <p>
      ${locale === 'ru' ? 'Вы можете возобновить подписку в любое время в вашем личном кабинете:' : 'You can resume your subscription at any time from your account area:'}
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