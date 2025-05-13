import type { RefundProcessedEmailData } from '../../../types/emailTemplates' // Assuming this type will be added
import { generateBaseEmailLayout } from '../baseLayout'

export const generateRefundProcessedEmail = (
  data: RefundProcessedEmailData,
): string => {
  const { userName, orderNumber, refundAmount, currency, processedAt, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваш возврат по заказу #${orderNumber} обработан`
      : `Your Refund for Order #${orderNumber} Has Been Processed`

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Сообщаем вам, что ваш возврат средств по заказу <strong>#${orderNumber}</strong> на сумму <strong>${refundAmount} ${currency}</strong> был успешно обработан ${new Date(processedAt).toLocaleDateString(locale)}.` : `This email confirms that your refund for order <strong>#${orderNumber}</strong> in the amount of <strong>${currency}${refundAmount}</strong> has been successfully processed on ${new Date(processedAt).toLocaleDateString(locale)}.`}
    </p>
    <p>
      ${locale === 'ru' ? 'Средства должны поступить на ваш счет в течение нескольких рабочих дней, в зависимости от вашего банка или платежной системы.' : 'The funds should appear in your account within a few business days, depending on your bank or payment provider.'}
    </p>
    <p>
      ${locale === 'ru' ? 'Если у вас есть вопросы, пожалуйста, свяжитесь с нашей службой поддержки.' : 'If you have any questions, please contact our support team.'}
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}