import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'
import { lexicalToHtml } from '../../lexicalToHtml'

export interface NewsletterEmailData extends BaseEmailTemplateData {
  email: string
  unsubscribeToken?: string
  title?: string
  content?: string | Record<string, unknown>
}

/**
 * Email template for newsletter
 */
export class NewsletterEmail extends BaseEmailTemplate<NewsletterEmailData> {
  private email: string
  private title: string
  private content: string | Record<string, unknown>

  constructor(data: NewsletterEmailData) {
    super({
      ...data,
      unsubscribeUrl: data.unsubscribeToken ? `${data.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'}/api/newsletter/unsubscribe?token=${data.unsubscribeToken}` : undefined
    })
    this.email = data.email
    this.title = data.title || (this.locale === 'ru' ? 'Новости от Flow Masters' : 'News from Flow Masters')
    this.content = data.content || ''
  }

  protected generateContent() {
    // Process content if it's a Lexical object
    const processedContent = typeof this.content === 'object' 
      ? lexicalToHtml(this.content) 
      : this.content

    // Localized texts
    const texts = this.locale === 'ru' ? {
      greeting: 'Здравствуйте',
      intro: 'Спасибо за подписку на нашу рассылку. Вот последние новости:',
      visitWebsite: 'Посетить сайт',
      preferences: 'Настроить предпочтения',
      contact: 'Связаться с нами',
      footer: 'С уважением, команда Flow Masters',
      footerNotice: 'Вы получили это письмо, потому что подписались на рассылку новостей Flow Masters.'
    } : {
      greeting: 'Hello',
      intro: 'Thank you for subscribing to our newsletter. Here are the latest updates:',
      visitWebsite: 'Visit website',
      preferences: 'Manage preferences',
      contact: 'Contact us',
      footer: 'Best regards, Flow Masters Team',
      footerNotice: 'You received this email because you signed up for the Flow Masters newsletter.'
    }

    // Build the body content
    const bodyContent = `
      <h1>${this.title}</h1>
      <p>${texts.greeting},</p>
      <p>${texts.intro}</p>
      
      <div style="margin: 20px 0;">
        ${processedContent}
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${this.siteUrl}" class="button">${texts.visitWebsite}</a>
      </div>
    `

    const footerContent = `
      <p>${texts.footer}</p>
      <p>
        <a href="${this.siteUrl}/${this.locale}/profile">${texts.preferences}</a> |
        <a href="${this.siteUrl}/${this.locale}/contact">${texts.contact}</a>
      </p>
      <p style="font-size: 12px; color: #666;">${texts.footerNotice}</p>
    `

    return {
      subject: this.title,
      bodyContent,
      footerContent
    }
  }
}

/**
 * Generate HTML for newsletter email
 */
export function generateNewsletterEmail(data: NewsletterEmailData): string {
  const email = new NewsletterEmail(data)
  return email.generateHTML()
}
