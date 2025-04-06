import { generateBaseEmailLayout } from './baseLayout'

export interface AdminNewSubscriberNotificationEmailData {
  newSubscriberEmail: string
  newSubscriberName?: string
  adminPanelUrl: string
  siteUrl: string
}

/**
 * Генерирует HTML для письма уведомления администратора о новом подписчике
 * @param {AdminNewSubscriberNotificationEmailData} data Данные для шаблона
 * @returns {string} HTML-разметка письма
 */
export const generateAdminNewSubscriberNotificationEmail = (
  data: AdminNewSubscriberNotificationEmailData,
): string => {
  const {
    newSubscriberEmail,
    newSubscriberName,
    adminPanelUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000/admin',
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
  } = data

  const subject = 'Новый подписчик на Flow Masters'
  const subscriberInfo = newSubscriberName
    ? `${newSubscriberName} (${newSubscriberEmail})`
    : newSubscriberEmail

  const bodyContent = `
    <h1>${subject}</h1>
    <p>Новый пользователь подписался на рассылку:</p>
    <p><strong>${subscriberInfo}</strong></p>
    <p>
      <a href="${adminPanelUrl}/collections/newsletter-subscribers">Посмотреть в админ-панели</a>
    </p>
  `

  const footerContent = `
    <p><small>Это автоматическое уведомление с сайта ${siteUrl}</small></p>
    <p>© ${new Date().getFullYear()} Flow Masters</p>
  `

  return generateBaseEmailLayout({
    locale: 'ru', // Уведомление админу всегда на русском
    siteUrl,
    pageTitle: subject,
    bodyContent,
    footerContent,
  })
}
