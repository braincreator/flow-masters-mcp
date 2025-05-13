import type { SubscriptionActivatedEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionActivatedEmail = (
  data: SubscriptionActivatedEmailData,
): string => {
  const { userName, planName, startDate, nextPaymentDate, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваша подписка на ${planName} активирована!`
      : `Your Subscription to ${planName} is Active!`

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Ваша подписка на тарифный план <strong>${planName}</strong> была успешно активирована.` : `Your subscription to the <strong>${planName}</strong> plan has been successfully activated.`}
    </p>
    <p>
      ${locale === 'ru' ? `Дата начала подписки:` : `Subscription Start Date:`} ${new Date(startDate).toLocaleDateString(locale)}
    </p>
    <p>
      ${locale === 'ru' ? `Дата следующего платежа:` : `Next Payment Date:`} ${new Date(nextPaymentDate).toLocaleDateString(locale)}
    </p>
    <p>
      ${locale === 'ru' ? `Вы можете управлять вашей подпиской в личном кабинете:` : `You can manage your subscription in your account area:`}
      <a href="${siteUrl}/account/subscriptions">${siteUrl}/account/subscriptions</a>
    </p>
  `
  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
    // footerContent can be customized if needed, otherwise default from baseLayout is used
  })
}