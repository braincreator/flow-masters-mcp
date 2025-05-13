import type { SubscriptionRenewalReminderEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionRenewalReminderEmail = (
  data: SubscriptionRenewalReminderEmailData,
): string => {
  const { userName, planName, renewalDate, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Напоминание: ваша подписка на ${planName} скоро будет продлена`
      : `Reminder: Your Subscription to ${planName} is Renewing Soon`

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Это дружеское напоминание о том, что ваша подписка на тарифный план <strong>${planName}</strong> будет автоматически продлена ${new Date(renewalDate).toLocaleDateString(locale)}.` : `This is a friendly reminder that your subscription to the <strong>${planName}</strong> plan will be automatically renewed on ${new Date(renewalDate).toLocaleDateString(locale)}.`}
    </p>
    <p>
      ${locale === 'ru' ? 'Если вы хотите внести изменения в подписку или обновить платежную информацию, пожалуйста, сделайте это в вашем личном кабинете до указанной даты.' : 'If you wish to make any changes to your subscription or update your payment information, please do so in your account area before this date.'}
    </p>
    <p>
      <a href="${siteUrl}/account/subscriptions" class="button">${locale === 'ru' ? 'Управлять подпиской' : 'Manage Subscription'}</a>
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}