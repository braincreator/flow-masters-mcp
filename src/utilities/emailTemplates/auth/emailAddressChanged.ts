import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface EmailAddressChangedEmailData extends BaseEmailTemplateData {
  userName?: string
  newEmail: string
  oldEmail: string // Kept for context, though the email is sent to newEmail
}

/**
 * Email template for email address changed confirmation (sent to new email)
 */
export class EmailAddressChangedEmail extends BaseEmailTemplate<EmailAddressChangedEmailData> {
  private userName?: string
  private newEmail: string
  private oldEmail: string

  constructor(data: EmailAddressChangedEmailData) {
    super(data)
    this.userName = data.userName
    this.newEmail = data.newEmail
    this.oldEmail = data.oldEmail
  }

  protected generateContent() {
    // Localized texts
    const texts =
      this.locale === 'ru'
        ? {
            subject: 'Ваш адрес электронной почты был изменен',
            greeting: this.userName ? `Здравствуйте, ${this.userName}!` : 'Здравствуйте!',
            message: `Это письмо подтверждает, что адрес электронной почты для вашей учетной записи Flow Masters был изменен с ${this.oldEmail} на ${this.newEmail}.`,
            securityNote:
              'Если вы не вносили это изменение, немедленно свяжитесь с нашей службой поддержки.',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: 'Your Email Address Has Been Changed',
            greeting: this.userName ? `Hello, ${this.userName}!` : 'Hello!',
            message: `This email confirms that the email address for your Flow Masters account has been changed from ${this.oldEmail} to ${this.newEmail}.`,
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
 * Generate HTML for email address changed confirmation email (to new email)
 */
export function generateEmailAddressChangedEmail(data: EmailAddressChangedEmailData): string {
  const email = new EmailAddressChangedEmail(data)
  return email.generateHTML()
}