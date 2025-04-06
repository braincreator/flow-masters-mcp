import { generateBaseEmailLayout } from './baseLayout'

export interface WelcomeEmailData {
  email: string
  name?: string
  locale?: string
  siteUrl?: string
  unsubscribeToken?: string // Добавлен токен для возможности сразу отписаться
}

/**
 * Генерирует HTML для приветственного письма
 * @param {WelcomeEmailData} data Данные для шаблона
 * @returns {string} HTML-разметка письма
 */
export const generateWelcomeEmail = (data: WelcomeEmailData): string => {
  const {
    email,
    name,
    locale = 'ru',
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
    unsubscribeToken,
  } = data

  const unsubscribeUrl = unsubscribeToken
    ? `${siteUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`
    : null

  const texts = {
    subject: locale === 'ru' ? 'Добро пожаловать в Flow Masters!' : 'Welcome to Flow Masters!',
    greeting:
      locale === 'ru'
        ? name
          ? `Здравствуйте, ${name}!`
          : 'Здравствуйте!'
        : name
          ? `Hello ${name}!`
          : 'Hello!',
    welcomeMessage:
      locale === 'ru'
        ? 'Спасибо за подписку на нашу рассылку! Мы рады видеть вас в нашем сообществе.'
        : 'Thank you for subscribing to our newsletter! We are happy to have you in our community.',
    expectations:
      locale === 'ru'
        ? 'Вы будете получать от нас полезные статьи, новости и специальные предложения.'
        : 'You will receive useful articles, news, and special offers from us.',
    visitSite: locale === 'ru' ? 'Перейти на сайт' : 'Visit website',
    unsubscribe: locale === 'ru' ? 'Отписаться от рассылки' : 'Unsubscribe from newsletter',
    footerNotice:
      locale === 'ru'
        ? 'Вы получили это письмо, так как подписались на Flow Masters.'
        : 'You received this email because you subscribed to Flow Masters.',
  }

  const bodyContent = `
    <h1>${texts.subject}</h1>
    <p>${texts.greeting}</p>
    <p>${texts.welcomeMessage}</p>
    <p>${texts.expectations}</p>
    <a href="${siteUrl}" class="button">${texts.visitSite}</a>
  `

  const footerContent = `
    <p>${texts.footerNotice}</p>
    ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" class="unsubscribe-link">${texts.unsubscribe}</a>` : ''}
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
