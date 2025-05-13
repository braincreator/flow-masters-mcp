import type { SubscriptionExpiredEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionExpiredEmail = (
  data: SubscriptionExpiredEmailData,
): string => {
  const { userName, planName, expiredAt, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Срок действия вашей подписки на ${planName} истек`
      : `Your Subscription to ${planName} Has Expired`

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Срок действия вашей подписки на тарифный план <strong>${planName}</strong> истек ${new Date(expiredAt).toLocaleDateString(locale)}.` : `Your subscription to the <strong>${planName}</strong> plan expired on ${new Date(expiredAt).toLocaleDateString(locale)}.`}
    </p>
    <p>
      ${locale === 'ru' ? 'Чтобы продолжить пользоваться преимуществами тарифного плана, пожалуйста, оформите новую подписку:' : 'To continue enjoying the plan benefits, please subscribe again:'}
    </p>
    <p>
      <a href="${siteUrl}/pricing" class="button">${locale === 'ru' ? 'Выбрать тарифный план' : 'Choose a Plan'}</a>
    </p>
    <p>
      ${locale === 'ru' ? 'Если у вас есть вопросы, свяжитесь с нами.' : 'If you have any questions, please contact us.'}
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}