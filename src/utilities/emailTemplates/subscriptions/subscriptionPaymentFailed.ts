import type { SubscriptionPaymentFailedEmailData } from '../../../types/emailTemplates'
import { generateBaseEmailLayout } from '../baseLayout'

export const generateSubscriptionPaymentFailedEmail = (
  data: SubscriptionPaymentFailedEmailData,
): string => {
  const { userName, planName, nextPaymentDate, amount, currency, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Проблема с оплатой подписки ${planName}`
      : `Issue with Your ${planName} Subscription Payment`

  let amountText = ''
  if (amount && currency) {
    amountText = locale === 'ru' ? ` (${amount} ${currency})` : ` (${currency}${amount})`
  }

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Не удалось обработать платеж за вашу подписку на тарифный план <strong>${planName}</strong>${amountText}.` : `We were unable to process the payment for your subscription to the <strong>${planName}</strong> plan${amountText}.`}
    </p>
    <p>
      ${locale === 'ru' ? `Пожалуйста, обновите вашу платежную информацию в личном кабинете, чтобы избежать прерывания обслуживания. Следующая попытка списания будет ${new Date(nextPaymentDate).toLocaleDateString(locale)}.` : `Please update your payment information in your account area to avoid service interruption. The next payment attempt will be on ${new Date(nextPaymentDate).toLocaleDateString(locale)}.`}
    </p>
    <p>
      <a href="${siteUrl}/account/billing" class="button">${locale === 'ru' ? 'Обновить платежную информацию' : 'Update Payment Information'}</a>
    </p>
    <p>
      ${locale === 'ru' ? 'Если у вас возникли вопросы, пожалуйста, свяжитесь с нашей службой поддержки.' : 'If you have any questions, please contact our support team.'}
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}