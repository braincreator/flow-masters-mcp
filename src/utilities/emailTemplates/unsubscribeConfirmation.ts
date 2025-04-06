import { generateBaseEmailLayout } from './baseLayout'

export interface UnsubscribeConfirmationEmailData {
  email: string
  locale?: string
  siteUrl?: string
}

/**
 * Генерирует HTML для письма подтверждения отписки
 * @param {UnsubscribeConfirmationEmailData} data Данные для шаблона
 * @returns {string} HTML-разметка письма
 */
export const generateUnsubscribeConfirmationEmail = (
  data: UnsubscribeConfirmationEmailData,
): string => {
  const {
    email,
    locale = 'ru',
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
  } = data

  const texts = {
    subject: locale === 'ru' ? 'Вы отписались от рассылки Flow Masters' : 'You have unsubscribed',
    greeting: locale === 'ru' ? 'Здравствуйте,' : 'Hello,',
    message:
      locale === 'ru'
        ? `Вы успешно отписались от нашей рассылки (${email}). Вы больше не будете получать от нас письма.`
        : `You have successfully unsubscribed from our newsletter (${email}). You will no longer receive emails from us.`,
    resubscribePrompt:
      locale === 'ru'
        ? 'Если это была ошибка, вы можете подписаться снова:'
        : 'If this was a mistake, you can subscribe again:',
    subscribeButton: locale === 'ru' ? 'Подписаться снова' : 'Subscribe again',
    footerNotice:
      locale === 'ru'
        ? 'Вы получили это письмо, потому что ранее были подписаны на рассылку Flow Masters.'
        : 'You received this email because you were previously subscribed to the Flow Masters newsletter.',
  }

  const bodyContent = `
    <h1>${texts.subject}</h1>
    <p>${texts.greeting}</p>
    <p>${texts.message}</p>
    <p>${texts.resubscribePrompt}</p>
    <a href="${siteUrl}/#newsletter" class="button">${texts.subscribeButton}</a>
  `

  const footerContent = `
    <p>${texts.footerNotice}</p>
    <p>© ${new Date().getFullYear()} Flow Masters</p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: texts.subject,
    bodyContent,
    footerContent,
  })
}
