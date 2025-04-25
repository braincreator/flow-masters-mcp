import { lexicalToHtml } from '../lexicalToHtml'

export interface BaseEmailTemplateData {
  locale?: string
  siteUrl?: string
  unsubscribeUrl?: string
  previewText?: string
  email?: string
}

export interface EmailContent {
  subject: string
  bodyContent: string | Record<string, unknown>
  footerContent?: string
}

/**
 * Base class for all email templates
 * Provides common functionality and structure for email templates
 */
export abstract class BaseEmailTemplate<T extends BaseEmailTemplateData> {
  protected locale: string
  protected siteUrl: string
  protected unsubscribeUrl?: string
  protected previewText?: string

  constructor(data: T) {
    this.locale = data.locale || 'ru'
    this.siteUrl = data.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'
    this.unsubscribeUrl = data.unsubscribeUrl
    this.previewText = data.previewText
  }

  /**
   * Generate the email content
   * This method should be implemented by each template
   */
  protected abstract generateContent(): EmailContent

  /**
   * Generate the complete HTML for the email
   */
  public generateHTML(): string {
    const { subject, bodyContent, footerContent } = this.generateContent()

    // Convert Lexical content to HTML if needed
    const processedBodyContent =
      typeof bodyContent === 'object' ? lexicalToHtml(bodyContent) : bodyContent

    // Default footer if none provided
    const processedFooterContent = footerContent || this.getDefaultFooter()

    return `
<!DOCTYPE html>
<html lang="${this.locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  ${this.previewText ? `<meta name="description" content="${this.previewText}">` : ''}
  <style>
    /* Base styles for all emails */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 0;
      background-color: #ffffff;
      border: 1px solid #eaeaea;
      border-radius: 5px;
      overflow: hidden;
    }
    .email-header {
      text-align: center;
      padding: 25px 20px;
      background-color: #f8f8f8;
      border-bottom: 1px solid #eaeaea;
    }
    .email-logo {
      max-width: 150px;
      height: auto;
    }
    .email-content {
      padding: 30px 30px;
    }
    .email-footer {
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      background-color: #f8f8f8;
      border-top: 1px solid #eaeaea;
    }
    .button {
      display: inline-block;
      padding: 12px 25px;
      background-color: #0070f3;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
    }
    .secondary-button {
      display: inline-block;
      padding: 12px 25px;
      background-color: #f5f5f5;
      color: #333 !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
      border: 1px solid #ddd;
    }
    .unsubscribe-link {
      color: #666;
      font-size: 12px;
      margin-top: 15px;
      display: block;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    h1 {
      margin-top: 0;
      color: #111;
    }
    p {
      margin-bottom: 1em;
    }
    hr {
      border: none;
      border-top: 1px solid #eaeaea;
      margin: 25px 0;
    }
    .highlight-box {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .code-box {
      background-color: #e8f5e9;
      border: 2px dashed #4CAF50;
      padding: 15px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${this.siteUrl}/logo.png" alt="Flow Masters Logo" class="email-logo">
    </div>
    <div class="email-content">
      ${processedBodyContent}
    </div>
    <div class="email-footer">
      ${processedFooterContent}
      ${this.unsubscribeUrl ? this.getUnsubscribeLink() : ''}
    </div>
  </div>
</body>
</html>
    `
  }

  /**
   * Get the default footer content
   */
  protected getDefaultFooter(): string {
    const year = new Date().getFullYear()
    return `<p>© ${year} Flow Masters</p>`
  }

  /**
   * Get the unsubscribe link HTML
   */
  protected getUnsubscribeLink(): string {
    const text = this.locale === 'ru' ? 'Отписаться от рассылки' : 'Unsubscribe from newsletter'

    return `<a href="${this.unsubscribeUrl}" class="unsubscribe-link">${text}</a>`
  }

  /**
   * Get the subject line for the email
   */
  public getSubject(): string {
    return this.generateContent().subject
  }
}
