import type { SubscriptionCancelledEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionCancelledEmail = (
  data: SubscriptionCancelledEmailData,
): string => {
  const { userName, planName, endDate, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваша подписка на ${planName} была отменена`
      : `Your Subscription to ${planName} Has Been Cancelled`

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Сообщаем вам, что ваша подписка на тарифный план <strong>${planName}</strong> была отменена.` : `This email confirms that your subscription to the <strong>${planName}</strong> plan has been cancelled.`}
    </p>
    <p>
      ${locale === 'ru' ? `Доступ к функциям тарифного плана будет прекращен:` : `Access to the plan features will end on:`} ${new Date(endDate).toLocaleDateString(locale)}
    </p>
    <p>
      ${locale === 'ru' ? 'Если вы передумаете, вы всегда можете снова подписаться на наши услуги в вашем личном кабинете.' : 'If you change your mind, you can always re-subscribe to our services from your account area.'}
      <a href="${siteUrl}/account/subscriptions">${siteUrl}/account/subscriptions</a>
    </p>
    <p>
      ${locale === 'ru' ? 'Сожалеем, что вы уходите!' : 'We are sorry to see you go!'}
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}