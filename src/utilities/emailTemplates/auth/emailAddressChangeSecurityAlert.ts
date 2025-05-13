import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

// Uses the same data structure as EmailAddressChangedEmailData for simplicity,
// as the core information (old/new email, username) is relevant for both.
// The 'email' field in BaseEmailTemplateData will be the old email address for this alert.
export interface EmailAddressChangeSecurityAlertData extends BaseEmailTemplateData {
  userName?: string
  newEmail: string
  oldEmail: string // This will be the recipient email for this alert
}

/**
 * Email template for email address change security alert (sent to old email)
 */
export class EmailAddressChangeSecurityAlertEmail extends BaseEmailTemplate<EmailAddressChangeSecurityAlertData> {
  private userName?: string
  private newEmail: string
  private oldEmail: string // Recipient of this alert

  constructor(data: EmailAddressChangeSecurityAlertData) {
    super(data) // data.email here is the old email address
    this.userName = data.userName
    this.newEmail = data.newEmail
    this.oldEmail = data.oldEmail
  }

  protected generateContent() {
    // Localized texts
    const texts =
      this.locale === 'ru'
        ? {
            subject: 'Оповещение безопасности: Адрес электронной почты изменен',
            greeting: this.userName ? `Здравствуйте, ${this.userName}!` : 'Здравствуйте!',
            message: `Мы уведомляем вас, что адрес электронной почты для вашей учетной записи Flow Masters, связанный с ${this.oldEmail}, был изменен на ${this.newEmail}.`,
            securityAction:
              'Если вы не вносили это изменение, пожалуйста, немедленно свяжитесь с нашей службой поддержки, чтобы защитить вашу учетную запись.',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: 'Security Alert: Email Address Changed',
            greeting: this.userName ? `Hello, ${this.userName}!` : 'Hello!',
            message: `We are notifying you that the email address for your Flow Masters account associated with ${this.oldEmail} was changed to ${this.newEmail}.`,
            securityAction:
              'If you did not make this change, please contact our support team immediately to secure your account.',
            footer: 'Best regards, Flow Masters Team',
          }

    // Build the body content
    const bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.message}</p>
      <p style="font-weight: bold; color: #D32F2F;">${texts.securityAction}</p>
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
 * Generate HTML for email address change security alert email (to old email)
 */
export function generateEmailAddressChangeSecurityAlertEmail(
  data: EmailAddressChangeSecurityAlertData,
): string {
  const email = new EmailAddressChangeSecurityAlertEmail(data)
  return email.generateHTML()
}