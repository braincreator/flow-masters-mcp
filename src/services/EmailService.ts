import nodemailer from 'nodemailer'
import { Payload } from 'payload'
import { generateNewsletterEmail, NewsletterEmailData } from '@/utilities/emailTemplates/newsletter'
import { generateWelcomeEmail, WelcomeEmailData } from '@/utilities/emailTemplates/welcome'
import {
  generateUnsubscribeConfirmationEmail,
  UnsubscribeConfirmationEmailData,
} from '@/utilities/emailTemplates/unsubscribeConfirmation'
import {
  generateAdminNewSubscriberNotificationEmail,
  AdminNewSubscriberNotificationEmailData,
} from '@/utilities/emailTemplates/adminNewSubscriber'
import { EmailSetting } from '@/payload-types'

// Общий интерфейс для опций отправки почты
interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: any[]
}

// Интерфейс для опций шаблонизированного письма
interface TemplatedEmailOptions {
  to: string
  templateSlug: string
  data: Record<string, any>
}

// Интерфейс для настроек SMTP
interface SmtpSettings {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from?: string
}

// Результат массовой рассылки
interface BroadcastResult {
  totalSubscribers: number
  successfullySent: number
  failedToSend: number
  sendErrors: Array<{ error: string; id?: string }>
}

/**
 * Унифицированный сервис для отправки электронной почты
 */
export class EmailService {
  private payload: Payload
  private cachedSettings: SmtpSettings | null = null

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Получает настройки SMTP из глобальной коллекции email-settings
   */
  async getSmtpSettings(forceRefresh = false): Promise<SmtpSettings> {
    // Используем кэшированные настройки, если они есть и не требуется обновление
    if (this.cachedSettings && !forceRefresh) {
      return this.cachedSettings
    }

    try {
      const settings = (await this.payload.findGlobal({
        slug: 'email-settings',
      })) as EmailSetting

      if (
        !settings?.smtpHost ||
        !settings?.smtpPort ||
        !settings?.smtpUser ||
        !settings?.smtpPassword
      ) {
        throw new Error('SMTP settings are incomplete')
      }

      this.cachedSettings = {
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.smtpPort === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPassword,
        },
        from: settings.smtpUser, // По умолчанию используем имя пользователя как адрес From
      }

      return this.cachedSettings
    } catch (error) {
      this.payload.logger.error(
        `Failed to get SMTP settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      throw error
    }
  }

  /**
   * Создает транспорт nodemailer с указанными настройками
   */
  async createTransport(customSettings?: SmtpSettings): Promise<nodemailer.Transporter> {
    const settings = customSettings || (await this.getSmtpSettings())
    return nodemailer.createTransport(settings)
  }

  /**
   * Отправляет простое письмо
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, text, attachments } = options
    const fromAddress = options.from

    try {
      const settings = await this.getSmtpSettings()
      const transport = await this.createTransport(settings)

      this.payload.logger.info(`Attempting to send email to: ${to}, Subject: "${subject}"`)

      const info = await transport.sendMail({
        from: fromAddress || settings.from,
        to,
        subject,
        html,
        text,
        attachments,
      })

      // В режиме разработки показываем URL для просмотра письма
      if (process.env.NODE_ENV !== 'production' && info.messageId) {
        this.payload.logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
      }

      this.payload.logger.info(`Email successfully sent to: ${to}, MessageId: ${info.messageId}`)
      return true
    } catch (error: any) {
      this.payload.logger.error(`Failed to send email to ${to}: ${error.message}`)
      return false
    }
  }

  /**
   * Отправляет письмо на основе шаблона из коллекции email-templates
   */
  async sendTemplatedEmail(options: TemplatedEmailOptions): Promise<boolean> {
    const { to, templateSlug, data } = options

    try {
      // 1. Получаем шаблон письма
      const templateResult = await this.payload.find({
        collection: 'email-templates',
        where: {
          slug: {
            equals: templateSlug,
          },
        },
        limit: 1,
        depth: 1, // Важно: глубина 1 для получения связанных данных отправителя
      })

      if (!templateResult.docs || templateResult.docs.length === 0) {
        this.payload.logger.error(`Email template "${templateSlug}" not found`)
        return false
      }

      const template = templateResult.docs[0]

      // 2. Проверяем данные отправителя
      const sender = template.sender
      if (!sender || typeof sender !== 'object' || !sender.emailAddress) {
        this.payload.logger.error(`Sender information is missing for template "${templateSlug}"`)
        return false
      }

      // 3. Подготавливаем содержимое письма
      const subject = this.replacePlaceholders(template.subject, data)
      const bodyHtml = this.renderRichText(template.body, data)
      const signature = sender.signature ? this.renderRichText(sender.signature) : ''

      const finalHtml = `
        <html>
          <body>
            ${bodyHtml}
            ${signature ? `<hr />${signature}` : ''}
          </body>
        </html>
      `

      // 4. Отправляем письмо
      return await this.sendEmail({
        to,
        subject,
        html: finalHtml,
        from: `"${sender.senderName}" <${sender.emailAddress}>`,
      })
    } catch (error: any) {
      this.payload.logger.error(`Failed to send templated email to ${to}: ${error.message}`)
      return false
    }
  }

  /**
   * Отправляет рассылку всем активным подписчикам
   */
  async sendBroadcast(
    title: string,
    content: string,
    locale?: string,
    customSettings?: SmtpSettings,
  ): Promise<BroadcastResult> {
    try {
      // 1. Получаем настройки и создаем транспорт
      const settings = customSettings || (await this.getSmtpSettings())
      const transport = await this.createTransport(settings)

      // 2. Получаем всех активных подписчиков
      const subscribers = await this.payload.find({
        collection: 'newsletter-subscribers',
        where: {
          ...(locale ? { locale: { equals: locale } } : {}),
          status: { equals: 'active' },
        },
      })

      const result: BroadcastResult = {
        totalSubscribers: subscribers.docs.length,
        successfullySent: 0,
        failedToSend: 0,
        sendErrors: [],
      }

      // 3. Отправляем письма
      for (const subscriber of subscribers.docs) {
        try {
          await transport.sendMail({
            from: settings.from,
            to: subscriber.email,
            subject: title,
            html: content,
          })
          result.successfullySent++
        } catch (error: any) {
          result.failedToSend++
          result.sendErrors.push({
            error: `Failed to send to ${subscriber.email}: ${error.message}`,
            id: subscriber.id,
          })
          this.payload.logger.error(
            `Failed to send newsletter to ${subscriber.email}: ${error.message}`,
          )
        }
      }

      return result
    } catch (error: any) {
      this.payload.logger.error(`Failed to send broadcast: ${error.message}`)
      throw error
    }
  }

  /**
   * Отправляет приветственное письмо новому подписчику
   */
  async sendWelcomeEmail(
    data: Pick<WelcomeEmailData, 'email' | 'name' | 'locale' | 'unsubscribeToken'>,
  ): Promise<boolean> {
    try {
      const { email, name, locale, unsubscribeToken } = data
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'

      const emailData: WelcomeEmailData = {
        email,
        name,
        locale: locale || 'ru',
        unsubscribeToken,
        siteUrl,
      }

      const html = generateWelcomeEmail(emailData)
      const subject =
        locale === 'ru' ? 'Добро пожаловать в Flow Masters!' : 'Welcome to Flow Masters!'

      return await this.sendEmail({
        to: email,
        subject,
        html,
      })
    } catch (error: any) {
      this.payload.logger.error(`Failed to send welcome email: ${error.message}`)
      return false
    }
  }

  /**
   * Отправляет уведомление об отписке
   */
  async sendUnsubscribeConfirmation(
    data: Pick<UnsubscribeConfirmationEmailData, 'email' | 'locale'>,
  ): Promise<boolean> {
    try {
      const { email, locale } = data
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'

      const emailData: UnsubscribeConfirmationEmailData = {
        email,
        locale: locale || 'ru',
        siteUrl,
      }

      const html = generateUnsubscribeConfirmationEmail(emailData)
      const subject =
        locale === 'ru'
          ? 'Вы отписались от рассылки Flow Masters'
          : 'You have unsubscribed from Flow Masters'

      return await this.sendEmail({
        to: email,
        subject,
        html,
      })
    } catch (error: any) {
      this.payload.logger.error(`Failed to send unsubscribe confirmation: ${error.message}`)
      return false
    }
  }

  /**
   * Заменяет плейсхолдеры в тексте данными
   */
  private replacePlaceholders(template: string, data: Record<string, any>): string {
    if (!template) return ''
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match
    })
  }

  /**
   * Преобразует RichText в HTML (упрощенная версия)
   */
  private renderRichText(content: any, data?: Record<string, any>): string {
    if (!content) return ''

    // Простая реализация для преобразования richText в HTML
    let html = ''

    if (content.root && content.root.children) {
      html = content.root.children
        .map((node: any) => {
          if (node.type === 'paragraph') {
            return `<p>${node.children
              .map((textNode: any) => {
                let text = textNode.text || ''
                if (textNode.bold) text = `<strong>${text}</strong>`
                if (textNode.italic) text = `<em>${text}</em>`
                return text
              })
              .join('')}</p>`
          }
          return ''
        })
        .join('')
    }

    // Если есть данные для подстановки, заменяем плейсхолдеры
    if (data) {
      html = this.replacePlaceholders(html, data)
    }

    return html
  }
}
