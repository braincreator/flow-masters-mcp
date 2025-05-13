import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface AccountUpdatedEmailData extends BaseEmailTemplateData {
  userName?: string
  updatedFieldsText: string // A human-readable string describing what was updated, e.g., "your profile name and contact number"
}

/**
 * Email template for account details updated confirmation
 */
export class AccountUpdatedEmail extends BaseEmailTemplate<AccountUpdatedEmailData> {
  private userName?: string
  private updatedFieldsText: string

  constructor(data: AccountUpdatedEmailData) {
    super(data)
    this.userName = data.userName
    this.updatedFieldsText = data.updatedFieldsText
  }

  protected generateContent() {
    // Localized texts
    const texts =
      this.locale === 'ru'
        ? {
            subject: 'Данные вашей учетной записи обновлены',
            greeting: this.userName ? `Здравствуйте, ${this.userName}!` : 'Здравствуйте!',
            message: `Это письмо подтверждает, что данные вашей учетной записи Flow Masters были успешно обновлены. Были изменены следующие данные: ${this.updatedFieldsText}.`,
            securityNote:
              'Если вы не вносили эти изменения, немедленно свяжитесь с нашей службой поддержки.',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: 'Your Account Details Have Been Updated',
            greeting: this.userName ? `Hello, ${this.userName}!` : 'Hello!',
            message: `This email confirms that your Flow Masters account details have been successfully updated. The following details were changed: ${this.updatedFieldsText}.`,
            securityNote:
              'If you did not make these changes, please contact our support team immediately.',
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
 * Generate HTML for account updated confirmation email
 */
export function generateAccountUpdatedEmail(data: AccountUpdatedEmailData): string {
  const email = new AccountUpdatedEmail(data)
  return email.generateHTML()
}