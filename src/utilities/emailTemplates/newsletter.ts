export interface NewsletterEmailData {
  email: string
  unsubscribeToken?: string
  locale?: string
  title?: string
  content?: string
  siteUrl?: string
}

/**
 * Генерирует HTML для письма рассылки новостей
 * @param {NewsletterEmailData} data Данные для шаблона
 * @returns {string} HTML-разметка письма
 */
export const generateNewsletterEmail = (data: NewsletterEmailData): string => {
  const {
    email,
    unsubscribeToken,
    locale = 'ru',
    title = locale === 'ru' ? 'Новости от Flow Masters' : 'News from Flow Masters',
    content = '',
    siteUrl = 'https://flow-masters.ru',
  } = data

  // Базовый URL для отписки
  const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`

  // Тексты для локализации
  const texts = {
    greeting: locale === 'ru' ? 'Здравствуйте' : 'Hello',
    intro:
      locale === 'ru'
        ? 'Спасибо за подписку на нашу рассылку. Вот последние новости:'
        : 'Thank you for subscribing to our newsletter. Here are the latest updates:',
    visitWebsite: locale === 'ru' ? 'Посетить сайт' : 'Visit website',
    unsubscribe: locale === 'ru' ? 'Отписаться от рассылки' : 'Unsubscribe',
    footer:
      locale === 'ru'
        ? 'Вы получили это письмо, потому что подписались на рассылку новостей Flow Masters.'
        : 'You received this email because you signed up for the Flow Masters newsletter.',
    preferences: locale === 'ru' ? 'Настроить предпочтения' : 'Manage preferences',
    contact: locale === 'ru' ? 'Связаться с нами' : 'Contact us',
  }

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eaeaea;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0070f3;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #eaeaea;
    }
    .unsubscribe {
      color: #666;
      font-size: 12px;
      margin-top: 20px;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${siteUrl}/logo.png" alt="Flow Masters" class="logo">
    </div>
    
    <div class="content">
      <h1>${title}</h1>
      <p>${texts.greeting},</p>
      <p>${texts.intro}</p>
      
      <div>
        ${content}
      </div>
      
      <a href="${siteUrl}" class="button">${texts.visitWebsite}</a>
    </div>
    
    <div class="footer">
      <p>${texts.footer}</p>
      <p>
        <a href="${siteUrl}/profile">${texts.preferences}</a> | 
        <a href="${siteUrl}/contact">${texts.contact}</a>
      </p>
      <div class="unsubscribe">
        <a href="${unsubscribeUrl}">${texts.unsubscribe}</a>
      </div>
    </div>
  </div>
</body>
</html>
  `
}
