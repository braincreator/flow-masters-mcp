import { generateBaseEmailLayout } from './baseLayout'

export interface PasswordResetEmailData {
  email: string
  name?: string
  locale?: string
  resetToken: string
  siteUrl?: string
}

/**
 * Generates HTML for password reset email
 * @param {PasswordResetEmailData} data Data for the template
 * @returns {string} HTML markup for the email
 */
export const generatePasswordResetEmail = (data: PasswordResetEmailData): string => {
  const {
    email,
    name,
    locale = 'ru',
    resetToken,
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
  } = data

  const resetUrl = `${siteUrl}/${locale}/reset-password/${resetToken}`

  // Translations
  const translations = {
    ru: {
      subject: 'Сброс пароля',
      greeting: name ? `Здравствуйте, ${name}!` : 'Здравствуйте!',
      message:
        'Мы получили запрос на сброс пароля для вашей учетной записи. Чтобы сбросить пароль, нажмите на кнопку ниже:',
      buttonText: 'Сбросить пароль',
      expiration: 'Эта ссылка действительна в течение 1 часа.',
      ignoreMessage:
        'Если вы не запрашивали сброс пароля, проигнорируйте это письмо или свяжитесь с нашей службой поддержки.',
      footer: 'С уважением, команда Flow Masters',
    },
    en: {
      subject: 'Password Reset',
      greeting: name ? `Hello, ${name}!` : 'Hello!',
      message:
        'We received a request to reset the password for your account. To reset your password, click the button below:',
      buttonText: 'Reset Password',
      expiration: 'This link is valid for 1 hour.',
      ignoreMessage:
        'If you did not request a password reset, please ignore this email or contact our support team.',
      footer: 'Best regards, Flow Masters Team',
    },
  }

  const text = translations[locale as keyof typeof translations] || translations.ru

  const bodyContent = `
    <h1>${text.subject}</h1>
    <p style="margin-bottom: 24px; font-size: 16px; line-height: 24px; color: #333;">${text.greeting}</p>
    <p style="margin-bottom: 24px; font-size: 16px; line-height: 24px; color: #333;">${text.message}</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="button">${text.buttonText}</a>
    </div>
    <p style="margin-bottom: 12px; font-size: 14px; line-height: 20px; color: #666;">${text.expiration}</p>
    <p style="margin-bottom: 24px; font-size: 14px; line-height: 20px; color: #666;">${text.ignoreMessage}</p>
    <p style="margin-bottom: 0; font-size: 16px; line-height: 24px; color: #333;">${text.footer}</p>
  `

  const footerContent = `<p>© ${new Date().getFullYear()} Flow Masters. All rights reserved.</p>`

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: text.subject,
    bodyContent,
    footerContent,
  })
}
