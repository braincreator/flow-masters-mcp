import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface PasswordResetEmailData extends BaseEmailTemplateData {
  email: string
  name?: string
  resetToken: string
}

/**
 * Email template for password reset
 */
export class PasswordResetEmail extends BaseEmailTemplate<PasswordResetEmailData> {
  private email: string
  private name?: string
  private resetToken: string
  private resetUrl: string

  constructor(data: PasswordResetEmailData) {
    super(data)
    this.email = data.email
    this.name = data.name
    this.resetToken = data.resetToken
    this.resetUrl = `${this.siteUrl}/${this.locale}/reset-password?token=${this.resetToken}&email=${encodeURIComponent(this.email)}`
  }

  protected generateContent() {
    // Localized texts
    const texts =
      this.locale === 'ru'
        ? {
            subject: 'Сброс пароля',
            greeting: this.name ? `Здравствуйте, ${this.name}!` : 'Здравствуйте!',
            message:
              'Мы получили запрос на сброс пароля для вашей учетной записи. Чтобы сбросить пароль, нажмите на кнопку ниже:',
            buttonText: 'Сбросить пароль',
            expiration: 'Эта ссылка действительна в течение 1 часа.',
            ignoreMessage:
              'Если вы не запрашивали сброс пароля, проигнорируйте это письмо или свяжитесь с нашей службой поддержки.',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: 'Password Reset',
            greeting: this.name ? `Hello, ${this.name}!` : 'Hello!',
            message:
              'We received a request to reset the password for your account. To reset your password, click the button below:',
            buttonText: 'Reset Password',
            expiration: 'This link is valid for 1 hour.',
            ignoreMessage:
              'If you did not request a password reset, please ignore this email or contact our support team.',
            footer: 'Best regards, Flow Masters Team',
          }

    // Build the body content
    const bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.message}</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${this.resetUrl}" class="button">${texts.buttonText}</a>
      </div>
      <p style="color: #666; font-size: 14px;">${texts.expiration}</p>
      <p style="color: #666; font-size: 14px;">${texts.ignoreMessage}</p>
    `

    const footerContent = `
      <p>${texts.footer}</p>
    `

    return {
      subject: texts.subject,
      bodyContent,
      footerContent,
    }
  }
}

/**
 * Generate HTML for password reset email
 */
export function generatePasswordResetEmail(data: PasswordResetEmailData): string {
  const email = new PasswordResetEmail(data)
  return email.generateHTML()
}
