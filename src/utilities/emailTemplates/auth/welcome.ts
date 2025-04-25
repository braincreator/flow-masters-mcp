import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface WelcomeEmailData extends BaseEmailTemplateData {
  email: string
  name?: string
  unsubscribeToken?: string
}

/**
 * Email template for welcome email
 */
export class WelcomeEmail extends BaseEmailTemplate<WelcomeEmailData> {
  private email: string
  private name?: string

  constructor(data: WelcomeEmailData) {
    super({
      ...data,
      unsubscribeUrl: data.unsubscribeToken ? `${data.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'}/api/newsletter/unsubscribe?token=${data.unsubscribeToken}` : undefined
    })
    this.email = data.email
    this.name = data.name
  }

  protected generateContent() {
    // Localized texts
    const texts = this.locale === 'ru' ? {
      subject: 'Добро пожаловать в Flow Masters!',
      greeting: this.name ? `Здравствуйте, ${this.name}!` : 'Здравствуйте!',
      welcomeMessage: 'Спасибо за подписку на нашу рассылку! Мы рады видеть вас в нашем сообществе.',
      expectations: 'Вы будете получать от нас полезные статьи, новости и специальные предложения.',
      visitSite: 'Перейти на сайт',
      footer: 'С уважением, команда Flow Masters',
      footerNotice: 'Вы получили это письмо, так как подписались на Flow Masters.'
    } : {
      subject: 'Welcome to Flow Masters!',
      greeting: this.name ? `Hello, ${this.name}!` : 'Hello!',
      welcomeMessage: 'Thank you for subscribing to our newsletter! We are happy to have you in our community.',
      expectations: 'You will receive useful articles, news, and special offers from us.',
      visitSite: 'Visit website',
      footer: 'Best regards, Flow Masters Team',
      footerNotice: 'You received this email because you subscribed to Flow Masters.'
    }

    // Build the body content
    const bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.welcomeMessage}</p>
      <p>${texts.expectations}</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${this.siteUrl}" class="button">${texts.visitSite}</a>
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
 * Generate HTML for welcome email
 */
export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const email = new WelcomeEmail(data)
  return email.generateHTML()
}
