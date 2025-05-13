import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface PasswordChangedEmailData extends BaseEmailTemplateData {
  email: string
  userName?: string
}

/**
 * Email template for password changed confirmation
 */
export class PasswordChangedEmail extends BaseEmailTemplate<PasswordChangedEmailData> {
  private userName?: string

  constructor(data: PasswordChangedEmailData) {
    super(data)
    this.userName = data.userName
  }

  protected generateContent() {
    // Localized texts
    const texts =
      this.locale === 'ru'
        ? {
            subject: 'Ваш пароль был изменен',
            greeting: this.userName ? `Здравствуйте, ${this.userName}!` : 'Здравствуйте!',
            message:
              'Это письмо подтверждает, что пароль для вашей учетной записи Flow Masters был успешно изменен.',
            securityNote:
              'Если вы не меняли пароль, немедленно свяжитесь с нашей службой поддержки.',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: 'Your Password Has Been Changed',
            greeting: this.userName ? `Hello, ${this.userName}!` : 'Hello!',
            message:
              'This email confirms that the password for your Flow Masters account has been successfully changed.',
            securityNote:
              'If you did not make this change, please contact our support team immediately.',
            footer: 'Best regards, Flow Masters Team',
          }

    // Build the body content
    const bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.message}</p>
      <p style="color: #666; font-size: 14px;">${texts.securityNote}</p>
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
 * Generate HTML for password changed confirmation email
 */
export function generatePasswordChangedEmail(data: PasswordChangedEmailData): string {
  const email = new PasswordChangedEmail(data)
  return email.generateHTML()
}