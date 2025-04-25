import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface UnsubscribeConfirmationEmailData extends BaseEmailTemplateData {
  email: string
}

/**
 * Email template for unsubscribe confirmation
 */
export class UnsubscribeConfirmationEmail extends BaseEmailTemplate<UnsubscribeConfirmationEmailData> {
  private email: string

  constructor(data: UnsubscribeConfirmationEmailData) {
    super(data)
    this.email = data.email
  }

  protected generateContent() {
    // Localized texts
    const texts = this.locale === 'ru' ? {
      subject: 'Вы отписались от рассылки Flow Masters',
      greeting: 'Здравствуйте,',
      message: `Вы успешно отписались от нашей рассылки (${this.email}). Вы больше не будете получать от нас письма.`,
      resubscribePrompt: 'Если это была ошибка, вы можете подписаться снова:',
      subscribeButton: 'Подписаться снова',
      footer: 'С уважением, команда Flow Masters',
      footerNotice: 'Вы получили это письмо, потому что ранее были подписаны на рассылку Flow Masters.'
    } : {
      subject: 'You have unsubscribed from Flow Masters',
      greeting: 'Hello,',
      message: `You have successfully unsubscribed from our newsletter (${this.email}). You will no longer receive emails from us.`,
      resubscribePrompt: 'If this was a mistake, you can subscribe again:',
      subscribeButton: 'Subscribe again',
      footer: 'Best regards, Flow Masters Team',
      footerNotice: 'You received this email because you were previously subscribed to the Flow Masters newsletter.'
    }

    // Build the body content
    const bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.message}</p>
      <p>${texts.resubscribePrompt}</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${this.siteUrl}/#newsletter" class="button">${texts.subscribeButton}</a>
      </div>
    `

    const footerContent = `
      <p>${texts.footer}</p>
      <p style="font-size: 12px; color: #666;">${texts.footerNotice}</p>
    `

    return {
      subject: texts.subject,
      bodyContent,
      footerContent
    }
  }
}

/**
 * Generate HTML for unsubscribe confirmation email
 */
export function generateUnsubscribeConfirmationEmail(data: UnsubscribeConfirmationEmailData): string {
  const email = new UnsubscribeConfirmationEmail(data)
  return email.generateHTML()
}
