import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface AdminNewSubscriberNotificationEmailData extends BaseEmailTemplateData {
  newSubscriberEmail: string
  newSubscriberName?: string
  adminPanelUrl?: string
}

/**
 * Email template for admin notification about new subscriber
 */
export class AdminNewSubscriberNotificationEmail extends BaseEmailTemplate<AdminNewSubscriberNotificationEmailData> {
  private newSubscriberEmail: string
  private newSubscriberName?: string
  private adminPanelUrl: string

  constructor(data: AdminNewSubscriberNotificationEmailData) {
    super({
      ...data,
      locale: 'ru' // Admin notifications are always in Russian
    })
    this.newSubscriberEmail = data.newSubscriberEmail
    this.newSubscriberName = data.newSubscriberName
    this.adminPanelUrl = data.adminPanelUrl || `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000/admin'}`
  }

  protected generateContent() {
    const subject = 'Новый подписчик на Flow Masters'
    const subscriberInfo = this.newSubscriberName
      ? `${this.newSubscriberName} (${this.newSubscriberEmail})`
      : this.newSubscriberEmail

    // Build the body content
    const bodyContent = `
      <h1>${subject}</h1>
      <p>Новый пользователь подписался на рассылку:</p>
      <p><strong>${subscriberInfo}</strong></p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${this.adminPanelUrl}/collections/newsletter-subscribers" class="button">Посмотреть в админ-панели</a>
      </div>
    `

    const footerContent = `
      <p><small>Это автоматическое уведомление с сайта ${this.siteUrl}</small></p>
      <p>© ${new Date().getFullYear()} Flow Masters</p>
    `

    return {
      subject,
      bodyContent,
      footerContent
    }
  }
}

/**
 * Generate HTML for admin new subscriber notification email
 */
export function generateAdminNewSubscriberNotificationEmail(data: AdminNewSubscriberNotificationEmailData): string {
  const email = new AdminNewSubscriberNotificationEmail(data)
  return email.generateHTML()
}
