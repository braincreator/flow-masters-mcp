import type { SubscriptionPlanChangedEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionPlanChangedEmail = (
  data: SubscriptionPlanChangedEmailData,
): string => {
  const { userName, oldPlanName, newPlanName, effectiveDate, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? 'Изменение вашего тарифного плана подписки'
      : 'Your Subscription Plan Has Been Changed'

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? 'Информируем вас об изменении вашего тарифного плана подписки.' : 'This email confirms that your subscription plan has been changed.'}
    </p>
    <p>
      ${locale === 'ru' ? 'Старый тарифный план:' : 'Previous Plan:'} <strong>${oldPlanName}</strong>
    </p>
    <p>
      ${locale === 'ru' ? 'Новый тарифный план:' : 'New Plan:'} <strong>${newPlanName}</strong>
    </p>
    <p>
      ${locale === 'ru' ? 'Изменения вступают в силу с:' : 'Effective Date:'} ${new Date(effectiveDate).toLocaleDateString(locale)}
    </p>
    <p>
      ${locale === 'ru' ? 'Все детали вашей новой подписки доступны в вашем личном кабинете:' : 'All details of your new subscription are available in your account area:'}
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