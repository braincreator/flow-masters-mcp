import type { Payload } from 'payload'
import { BaseService } from './base.service'
import nodemailer from 'nodemailer'
import { lexicalToHtml } from '../utilities/lexicalToHtml'
import { EmailTemplateSlug, TemplateDataMap } from '../types/emailTemplates'

// Import all email templates from the centralized index
// Auth emails
import { generatePasswordResetEmail } from '../utilities/emailTemplates/auth/passwordReset'
import { generateWelcomeEmail } from '../utilities/emailTemplates/auth/welcome'
import { generateUnsubscribeConfirmationEmail } from '../utilities/emailTemplates/auth/unsubscribeConfirmation'

// Newsletter emails
import { generateNewsletterEmail } from '../utilities/emailTemplates/newsletters/newsletter'
import { generateAdminNewSubscriberNotificationEmail } from '../utilities/emailTemplates/newsletters/adminNewSubscriber'

// Course emails
import { generateCourseEnrollmentEmail } from '../utilities/emailTemplates/courses/courseEnrollment'
import { generateCourseCompletionEmail } from '../utilities/emailTemplates/courses/courseCompletion'
import { generateCourseProgressEmail } from '../utilities/emailTemplates/courses/courseProgress'
import { generateCourseCertificateEmail } from '../utilities/emailTemplates/courses/courseCertificate'

// Order emails
import { generateOrderConfirmationEmail } from '../utilities/emailTemplates/orders/orderConfirmation'
import { generatePaymentConfirmationEmail } from '../utilities/emailTemplates/orders/paymentConfirmation'

// Reward emails
import { generateRewardGenericEmail } from '../utilities/emailTemplates/rewards/rewardGeneric'
import { generateRewardDiscountEmail } from '../utilities/emailTemplates/rewards/rewardDiscount'
import { generateRewardFreeCourseEmail } from '../utilities/emailTemplates/rewards/rewardFreeCourse'

// Project emails
import { generateProjectReportNotificationEmail } from '../utilities/emailTemplates/projects/projectReportNotification'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Import types from emailTemplates.ts
import {
  PasswordResetEmailData,
  WelcomeEmailData,
  UnsubscribeConfirmationEmailData,
  NewsletterEmailData,
  AdminNewSubscriberNotificationEmailData,
  CourseEnrollmentEmailData,
  CourseCompletionEmailData,
  CourseProgressEmailData,
  CourseCertificateEmailData,
  OrderConfirmationEmailData,
  PaymentConfirmationEmailData,
  RewardEmailData,
  ProjectReportNotificationEmailData,
} from '../types/emailTemplates'

// Интерфейс для опций отправки письма
interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

interface EmailSettingsType {
  smtp?: {
    host: string
    port: number
    user: string
    password: string
    from?: string
  }
}

// Интерфейс для шаблона письма
interface EmailTemplateType {
  id: string
  name: string
  slug: string
  subject: string | Record<string, string>
  body: string | Record<string, unknown>
  sender?:
    | {
        emailAddress: string
        senderName: string
      }
    | string
}

// Интерфейс для опций отправки шаблонного письма
interface SendTemplateOptions {
  locale?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  customSender?: {
    email: string
    name: string
  }
}

// Интерфейс для данных отслеживания заказа
interface OrderTrackingData {
  orderId: string
  status: string
  downloadLinks?: string[]
  [key: string]: unknown
}

export interface SendToAllResult {
  totalSubscribers: number
  successfullySent: number
  failedToSend: number
  sendErrors: Array<{ error: string }>
}

export class EmailService extends BaseService {
  private static instance: EmailService | null = null

  private constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService(payload)
    }
    return EmailService.instance
  }

  /**
   * Создает транспорт для nodemailer в зависимости от окружения
   */
  private createTransport(customSettings?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
    from?: string
  }) {
    if (customSettings) {
      return nodemailer.createTransport(customSettings)
    }

    // Check if real email sending is enabled in development
    const useRealEmailInDev = process.env.USE_REAL_EMAIL_IN_DEV === 'true'

    // If we're in development and not using real email, use ethereal (fake SMTP service)
    if (process.env.NODE_ENV !== 'production' && !useRealEmailInDev) {
      // Create a test account on ethereal.email
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER || '',
          pass: process.env.ETHEREAL_PASSWORD || '',
        },
      })
    }

    // Проверка наличия необходимых переменных окружения
    if (
      (process.env.NODE_ENV === 'production' || useRealEmailInDev) &&
      (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD)
    ) {
      logError('SMTP configuration is missing for email sending!')
    }

    // Use real SMTP settings for production or when explicitly enabled in development
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  /**
   * Получает настройки email из глобальных настроек
   */
  async getEmailSettings() {
    try {
      const emailSettings = await this.payload.findGlobal({
        slug: 'email-settings',
      })
      const settings = {
        smtp: {
          host: emailSettings?.smtpHost,
          port: emailSettings?.smtpPort,
          user: emailSettings?.smtpUser,
          password: emailSettings?.smtpPassword,
        },
        from: 'Flow Masters',
      } as EmailSettingsType
      logDebug('settings', settings)
      if (!settings?.smtp) {
        throw new Error('SMTP settings not configured')
      }

      return {
        host: settings.smtp.host,
        port: settings.smtp.port,
        secure: settings.smtp.port === 465,
        auth: {
          user: settings.smtp.user,
          pass: settings.smtp.password,
        },
        from: settings.smtp.from || 'admin@flow-masters.ru',
      }
    } catch (error) {
      logError('Failed to get email settings:', error)
      return null
    }
  }

  /**
   * Отправляет email с заданными параметрами
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    // Возвращаем значение по умолчанию для EMAIL_FROM и проверяем его наличие
    const fromAddress = options.from || process.env.EMAIL_FROM || 'admin@flow-masters.ru'
    const { to, subject, html } = options

    try {
      if (!fromAddress) {
        logError(
          "Email 'from' address is not configured (EMAIL_FROM environment variable) and no default provided.",
        )
        return false
      }

      const transport = this.createTransport()
      logDebug("Debug:",  `Attempting to send email. From: ${fromAddress}, To: ${to}, Subject: \"${subject}\"`,
      )

      const info = await transport.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      })

      // Check if we're using Ethereal (fake SMTP) in development
      const useRealEmailInDev = process.env.USE_REAL_EMAIL_IN_DEV === 'true'
      const isEtherealEmail = process.env.NODE_ENV !== 'production' && !useRealEmailInDev

      // In development mode with Ethereal, show preview URL
      if (isEtherealEmail && info.messageId) {
        logDebug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
      }

      // If using real email in development, log a clear message
      if (process.env.NODE_ENV !== 'production' && useRealEmailInDev) {
        logDebug(`REAL EMAIL SENT to ${to} - Check the actual inbox!`)
      }

      logDebug("Debug:",  `Email successfully sent. To: ${to}, Subject: \"${subject}\", Message ID: ${info.messageId}`,
      )
      return true
    } catch (error) {
      logError(
        `Error sending email from ${fromAddress} to ${to} with subject \"${subject}\":`,
        error,
      )
      return false
    }
  }

  /**
   * Отправляет письмо рассылки подписчику
   */
  async sendNewsletterEmailWithLogging(
    subscriberId: string,
    title: string,
    content: string,
  ): Promise<{ success: boolean; email?: string; error?: string }> {
    try {
      const subscriber = await this.payload.findByID({
        collection: 'newsletter-subscribers',
        id: subscriberId,
      })

      if (!subscriber || subscriber.status !== 'active') {
        const reason = !subscriber ? 'not found' : 'inactive'
        this.payload.logger.warn(`Cannot send newsletter to subscriber ${subscriberId}: ${reason}`)
        return { success: false, email: subscriber?.email, error: `Subscriber ${reason}` }
      }

      const emailData: NewsletterEmailData = {
        email: subscriber.email,
        unsubscribeToken: subscriber.unsubscribeToken ?? undefined,
        locale: subscriber.locale || 'ru',
        title,
        content,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
      }

      const html = generateNewsletterEmail(emailData)

      const result = await this.sendEmail({
        to: subscriber.email,
        subject: title,
        html,
      })

      if (result) {
        await this.payload.update({
          collection: 'newsletter-subscribers',
          id: subscriberId,
          data: {
            lastSent: new Date().toISOString(),
          },
        })
        this.payload.logger.info(`Newsletter email sent successfully to ${subscriber.email}`)
        return { success: true, email: subscriber.email }
      } else {
        this.payload.logger.error(`Failed to send newsletter email to ${subscriber.email}`)
        return { success: false, email: subscriber.email, error: 'Send email function failed' }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.payload.logger.error(
        `Error sending newsletter email to subscriber ${subscriberId}: ${errorMessage}`,
      )
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Отправляет письмо рассылки всем подписчикам с учетом локали
   */
  async sendBroadcast(
    title: string,
    content: string | Record<string, unknown>, // Support for Lexical content
    locale?: string,
    customSmtpSettings?: {
      host: string
      port: number
      secure: boolean
      auth: {
        user: string
        pass: string
      }
      from?: string
    },
  ): Promise<SendToAllResult> {
    try {
      // Используем переданные настройки SMTP или получаем из базы
      const emailSettings = customSmtpSettings || (await this.getEmailSettings())

      if (!emailSettings) {
        throw new Error('SMTP settings not configured')
      }

      const transporter = this.createTransport(emailSettings)

      // Получаем всех подписчиков
      const subscribers = await this.payload.find({
        collection: 'newsletter-subscribers',
        where: {
          and: [
            {
              status: {
                equals: 'active',
              },
            },
            ...(locale ? [{ locale: { equals: locale } }] : []),
          ],
        },
      })

      const results: SendToAllResult = {
        totalSubscribers: subscribers.docs.length,
        successfullySent: 0,
        failedToSend: 0,
        sendErrors: [],
      }

      // Отправляем письма
      for (const subscriber of subscribers.docs) {
        try {
          const emailData: NewsletterEmailData = {
            email: subscriber.email,
            unsubscribeToken: subscriber.unsubscribeToken ?? undefined,
            locale: subscriber.locale || 'ru',
            title,
            content,
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
          }

          const html = generateNewsletterEmail(emailData)

          await transporter.sendMail({
            from: emailSettings?.from || process.env.EMAIL_FROM || 'admin@flow-masters.ru',
            to: subscriber.email,
            subject: title,
            html,
          })

          await this.payload.update({
            collection: 'newsletter-subscribers',
            id: subscriber.id,
            data: {
              lastSent: new Date().toISOString(),
            },
          })

          results.successfullySent++
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          results.failedToSend++
          results.sendErrors.push({
            error: `Failed to send to ${subscriber.email}: ${errorMessage}`,
          })
          this.payload.logger.error(`Failed to send newsletter email to ${subscriber.email}`)
        }
      }

      return results
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.payload.logger.error(`Failed to process newsletter broadcast: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Отправляет приветственное письмо подписчику
   */
  async sendWelcomeEmail(
    subscriberData: Pick<WelcomeEmailData, 'email' | 'name' | 'locale' | 'unsubscribeToken'>,
  ): Promise<boolean> {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'

      const emailData: WelcomeEmailData = {
        ...subscriberData,
        siteUrl,
      }

      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        'welcome-email',
        subscriberData.email,
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(emailData)),
        { locale: subscriberData.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      // Otherwise, fall back to the code-based template
      const html = generateWelcomeEmail(emailData)

      const result = await this.sendEmail({
        to: subscriberData.email,
        subject:
          subscriberData.locale === 'ru'
            ? 'Добро пожаловать в Flow Masters'
            : 'Welcome to Flow Masters',
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send welcome email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо подтверждения отписки
   */
  async sendUnsubscribeConfirmationEmail(
    subscriberData: Pick<UnsubscribeConfirmationEmailData, 'email' | 'locale'>,
  ): Promise<boolean> {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'

      const emailData: UnsubscribeConfirmationEmailData = {
        ...subscriberData,
        siteUrl,
      }

      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        EmailTemplateSlug.UNSUBSCRIBE_CONFIRMATION,
        subscriberData.email,
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(emailData)),
        { locale: subscriberData.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      const html = generateUnsubscribeConfirmationEmail(emailData)

      const result = await this.sendEmail({
        to: subscriberData.email,
        subject:
          subscriberData.locale === 'ru'
            ? 'Вы успешно отписались от рассылки'
            : 'You have successfully unsubscribed',
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send unsubscribe confirmation email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо для сброса пароля
   */
  async sendPasswordResetEmail(
    userData: Pick<PasswordResetEmailData, 'email' | 'name' | 'locale' | 'resetToken'>,
  ): Promise<boolean> {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'

      const emailData: PasswordResetEmailData = {
        ...userData,
        siteUrl,
      }

      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        EmailTemplateSlug.PASSWORD_RESET,
        userData.email,
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(emailData)),
        { locale: userData.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      const html = generatePasswordResetEmail(emailData)

      const result = await this.sendEmail({
        to: userData.email,
        subject: userData.locale === 'ru' ? 'Сброс пароля' : 'Password Reset',
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send password reset email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо о зачислении на курс
   */
  async sendCourseEnrollmentEmail(data: CourseEnrollmentEmailData): Promise<boolean> {
    try {
      // Ensure email field is set
      const emailTo = data.userName?.includes('@') ? data.userName : data.email || ''
      if (!emailTo) {
        logError('No email address provided for course enrollment email')
        return false
      }

      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        'course-enrollment',
        emailTo,
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(data)),
        { locale: data.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      // Otherwise, fall back to the code-based template
      const html = generateCourseEnrollmentEmail(data)

      const result = await this.sendEmail({
        to: emailTo,
        subject:
          data.locale === 'ru'
            ? `Вы успешно записаны на курс "${data.courseName}"`
            : `You've successfully enrolled in "${data.courseName}"`,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send course enrollment email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо о завершении курса
   */
  async sendCourseCompletionEmail(data: CourseCompletionEmailData): Promise<boolean> {
    try {
      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        'course-completion',
        data.userName?.includes('@') ? data.userName : data.email || '',
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(data)),
        { locale: data.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      const html = generateCourseCompletionEmail(data)

      const result = await this.sendEmail({
        to: data.userName.includes('@') ? data.userName : data.email || '',
        subject:
          data.locale === 'ru'
            ? `Поздравляем с завершением курса "${data.courseName}"!`
            : `Congratulations on completing "${data.courseName}"!`,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send course completion email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо о прогрессе в курсе
   */
  async sendCourseProgressEmail(data: CourseProgressEmailData): Promise<boolean> {
    try {
      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        'course-progress',
        data.userName?.includes('@') ? data.userName : data.email || '',
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(data)),
        { locale: data.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      const html = generateCourseProgressEmail(data)

      const result = await this.sendEmail({
        to: data.userName.includes('@') ? data.userName : data.email || '',
        subject:
          data.locale === 'ru'
            ? `${data.progressPercentage}% пройдено в курсе "${data.courseName}"`
            : `${data.progressPercentage}% completed in "${data.courseName}"`,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send course progress email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо с сертификатом о прохождении курса
   */
  async sendCourseCertificateEmail(data: CourseCertificateEmailData): Promise<boolean> {
    try {
      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        'course-certificate',
        data.userName?.includes('@') ? data.userName : data.email || '',
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(data)),
        { locale: data.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      const html = generateCourseCertificateEmail(data)

      const result = await this.sendEmail({
        to: data.userName.includes('@') ? data.userName : data.email || '',
        subject:
          data.locale === 'ru'
            ? `Ваш сертификат за курс "${data.courseName}"`
            : `Your certificate for "${data.courseName}"`,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send course certificate email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо с подтверждением заказа
   */
  async sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<boolean> {
    try {
      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        'order-confirmation',
        data.userName?.includes('@') ? data.userName : data.email || '',
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(data)),
        { locale: data.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      const html = generateOrderConfirmationEmail(data)

      const result = await this.sendEmail({
        to: data.userName.includes('@') ? data.userName : data.email || '',
        subject:
          data.locale === 'ru'
            ? `Подтверждение заказа #${data.orderNumber}`
            : `Order Confirmation #${data.orderNumber}`,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send order confirmation email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо с подтверждением оплаты
   */
  async sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData): Promise<boolean> {
    try {
      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        'payment-confirmation',
        data.userName?.includes('@') ? data.userName : data.email || '',
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(data)),
        { locale: data.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      const html = generatePaymentConfirmationEmail(data)

      const result = await this.sendEmail({
        to: data.userName.includes('@') ? data.userName : data.email || '',
        subject:
          data.locale === 'ru'
            ? `Подтверждение оплаты для заказа #${data.orderNumber}`
            : `Payment Confirmation for Order #${data.orderNumber}`,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send payment confirmation email:', error)
      return false
    }
  }

  /**
   * Отправляет письмо с уведомлением о награде
   */
  async sendRewardEmail(
    data: RewardEmailData & {
      discountAmount?: string
      discountType?: 'percentage' | 'fixed'
      applicableTo?: string
      courseId?: string
      courseUrl?: string
      courseDuration?: string
      courseLevel?: string
    },
  ): Promise<boolean> {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'

      // Ensure we have all required data
      const emailData: RewardEmailData = {
        ...data,
        siteUrl,
      }

      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        EmailTemplateSlug.REWARD_GENERIC,
        data.userName?.includes('@') ? data.userName : data.email || '',
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(emailData)),
        { locale: data.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      // Otherwise, fall back to the code-based template
      const html = generateRewardGenericEmail(emailData)

      const result = await this.sendEmail({
        to: data.userName?.includes('@') ? data.userName : data.email || '',
        subject:
          data.locale === 'ru'
            ? `Вы получили награду: ${data.rewardTitle}`
            : `You've received a reward: ${data.rewardTitle}`,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send reward email:', error)
      return false
    }
  }

  /**
   * Отправляет уведомление администратору о новом подписчике
   */
  async sendAdminNewSubscriberNotification(
    subscriberData: Pick<
      AdminNewSubscriberNotificationEmailData,
      'newSubscriberEmail' | 'newSubscriberName'
    >,
  ): Promise<boolean> {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'
      const adminPanelUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000/admin'
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@flow-masters.ru'

      // Ensure we have all required data
      const emailData: AdminNewSubscriberNotificationEmailData = {
        ...subscriberData,
        siteUrl,
        adminPanelUrl,
        email: adminEmail,
      }

      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        EmailTemplateSlug.ADMIN_NEW_SUBSCRIBER,
        adminEmail,
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(emailData)),
        { locale: 'ru' }, // Admin notifications are always in Russian
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      // Otherwise, fall back to the code-based template
      const html = generateAdminNewSubscriberNotificationEmail(emailData)

      const result = await this.sendEmail({
        to: adminEmail,
        subject: 'Новый подписчик на рассылку',
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send admin notification email:', error)
      return false
    }
  }

  /**
   * Отправляет уведомление о новом платеже
   */
  async sendPaymentConfirmation({
    email,
    orderNumber,
    amount,
    items,
  }: {
    email: string
    orderNumber: string
    amount: number
    currency?: string
    items: Array<{
      title: string
      quantity: number
      price: number
    }>
  }): Promise<boolean> {
    try {
      // Здесь можно добавить генерацию HTML для письма о платеже
      // Пока используем простой HTML
      const html = `
        <h1>Оплата подтверждена</h1>
        <p>Ваш заказ #${orderNumber} на сумму ${amount} руб. успешно оплачен.</p>
        <h2>Детали заказа:</h2>
        <ul>
          ${items
            .map(
              (item) => `
            <li>${item.title} x ${item.quantity} = ${item.price * item.quantity} руб.</li>
          `,
            )
            .join('')}
        </ul>
        <p>Спасибо за покупку!</p>
      `

      const result = await this.sendEmail({
        to: email,
        subject: `Заказ #${orderNumber} оплачен`,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send payment confirmation email:', error)
      return false
    }
  }

  /**
   * Отправляет email на основе шаблона из коллекции email-templates
   * @param templateSlug Slug шаблона из коллекции email-templates
   * @param to Email получателя
   * @param data Данные для подстановки в шаблон
   * @param options Дополнительные опции
   * @returns Promise<boolean> Результат отправки
   */

  async sendTemplateEmail(
    templateSlug: string,
    to: string,
    data: Record<string, unknown>,
    options?: SendTemplateOptions,
  ): Promise<boolean> {
    try {
      // 1. Получаем шаблон из коллекции
      const templateResult = await this.payload.find({
        collection: 'email-templates',
        where: {
          slug: {
            equals: templateSlug,
          },
        },
        depth: 1, // Для загрузки связанных данных (sender)
      })

      if (!templateResult.docs.length) {
        this.payload.logger.error(`Email template "${templateSlug}" not found`)
        return false
      }

      const template = templateResult.docs[0] as EmailTemplateType

      // 2. Получаем данные отправителя
      let senderEmail: string
      let senderName: string

      if (options?.customSender) {
        senderEmail = options.customSender.email
        senderName = options.customSender.name
      } else if (template.sender && typeof template.sender === 'object') {
        // Sender загружен как объект благодаря depth: 1
        senderEmail = template.sender.emailAddress
        senderName = template.sender.senderName
      } else {
        // Fallback на настройки по умолчанию
        senderEmail = process.env.EMAIL_FROM || 'admin@flow-masters.ru'
        senderName = 'Flow Masters'
      }

      // 3. Получаем тему письма с учетом локализации
      const locale = options?.locale || 'ru'
      let subject = template.subject

      // Если subject - это объект с локализациями
      if (typeof subject === 'object' && subject !== null) {
        const subjectObj = subject as Record<string, string>
        const localizedSubject = subjectObj[locale] || subjectObj.ru || Object.values(subjectObj)[0]
        if (localizedSubject) {
          subject = localizedSubject
        }
      }

      // 4. Получаем тело письма
      let bodyContent = ''

      // Обрабатываем richText или обычный текст
      if (template.body) {
        if (typeof template.body === 'object' && template.body !== null) {
          // Это richText, нужно преобразовать в HTML
          bodyContent = this.convertRichTextToHTML(template.body)
        } else {
          // Это обычный текст
          bodyContent = String(template.body)
        }
      }

      // 5. Заменяем плейсхолдеры на данные
      bodyContent = this.replacePlaceholders(bodyContent, data)
      subject = this.replacePlaceholders(subject, data)

      // 6. Отправляем письмо
      const from = `"${senderName}" <${senderEmail}>`

      const emailOptions: SendEmailOptions = {
        to,
        subject,
        html: bodyContent,
        from,
      }

      // Добавляем CC и BCC если указаны
      if (options?.cc) {
        emailOptions.cc = options.cc
      }

      if (options?.bcc) {
        emailOptions.bcc = options.bcc
      }

      // Добавляем вложения если указаны
      if (options?.attachments && options.attachments.length > 0) {
        emailOptions.attachments = options.attachments
      }

      return await this.sendEmail(emailOptions)
    } catch (error) {
      this.payload.logger.error(`Failed to send template email ${templateSlug}:`, error)
      return false
    }
  }

  /**
   * Заменяет плейсхолдеры в тексте на значения из объекта данных
   * @param text Текст с плейсхолдерами вида {{key}}
   * @param data Объект с данными для подстановки
   * @returns Текст с замененными плейсхолдерами
   */
  private replacePlaceholders(
    text: string | Record<string, string>,
    data: Record<string, unknown>,
  ): string {
    // If text is not a string, convert it to a string
    const textStr = typeof text === 'string' ? text : JSON.stringify(text)

    return textStr.replace(/\{\{([^}]+)\}\}/g, (_match, key) => {
      const keys = key.trim().split('.')
      let value: unknown = data

      // Поддержка вложенных свойств (например, {{user.name}})
      for (const k of keys) {
        if (value === undefined || value === null) break
        value = (value as Record<string, unknown>)[k]
      }

      // Возвращаем значение или пустую строку, если значение не найдено
      return value !== undefined && value !== null ? String(value) : ''
    })
  }

  /**
   * Преобразует richText в HTML
   * @param richText Объект richText из Payload CMS
   * @returns HTML строка
   */
  private convertRichTextToHTML(richText: Record<string, unknown>): string {
    // Используем утилиту lexicalToHtml для преобразования Lexical в HTML
    return lexicalToHtml(richText)
  }

  /**
   * Отправляет email на основе шаблона (устаревший метод)
   * @deprecated Используйте sendTemplateEmail вместо этого метода
   */
  async sendTemplate(
    templateName: string,
    to: string,
    data: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      // Проверяем, есть ли шаблон в коллекции
      const templateResult = await this.payload.find({
        collection: 'email-templates',
        where: {
          slug: {
            equals: templateName,
          },
        },
      })

      // Если шаблон найден, используем новый метод
      if (templateResult.docs.length > 0) {
        return this.sendTemplateEmail(templateName, to, data)
      }

      // Иначе используем старую логику
      let html: string = ''

      switch (templateName) {
        case 'payment_confirmation':
          // TODO: Implement payment confirmation template
          html = `<h1>Payment Confirmation</h1><p>Your payment was confirmed.</p>`
          break
        case 'order_paid':
          // TODO: Implement order paid template
          html = `<h1>Order Paid</h1><p>Your order has been paid.</p>`
          break
        case 'download_ready':
          // TODO: Implement download ready template
          html = `<h1>Download Ready</h1><p>Your download is ready.</p>`
          break
        case 'order_completed':
          // TODO: Implement order completed template
          html = `<h1>Order Completed</h1><p>Your order has been completed.</p>`
          break
        case 'order_status_update':
          // TODO: Implement order status update template
          html = `<h1>Order Status Update</h1><p>Your order status has been updated.</p>`
          break
        case 'abandoned-cart':
          // TODO: Implement abandoned cart template
          html = `<h1>Abandoned Cart</h1><p>You have items in your cart.</p>`
          break
        default:
          logError(`Template ${templateName} not found`)
          return false
      }

      return await this.sendEmail({
        to,
        subject: templateName, // You might want to define a subject based on the template
        html,
      })
    } catch (error) {
      logError(`Failed to send template email ${templateName}:`, error)
      return false
    }
  }

  /**
   * Отправляет письма по кампании
   * @param campaignId ID кампании
   * @param recipients Получатели
   * @param templateSlug Slug шаблона
   * @param data Данные для шаблона
   * @returns Результат отправки
   */
  async sendCampaignEmails(
    campaignId: string,
    recipients: Array<{ id: string; email: string; name?: string; locale?: string }>,
    templateSlug: string,
    data: Record<string, unknown>,
  ): Promise<{ success: number; failed: number; errors: Array<{ email: string; error: string }> }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    }

    for (const recipient of recipients) {
      try {
        // Добавляем данные получателя в шаблон
        const templateData = {
          ...data,
          recipient: {
            id: recipient.id,
            email: recipient.email,
            name: recipient.name || '',
          },
          campaign: {
            id: campaignId,
          },
        }

        // Отправляем письмо
        const success = await this.sendTemplateEmail(templateSlug, recipient.email, templateData, {
          locale: recipient.locale || 'ru',
        })

        if (success) {
          results.success++
        } else {
          results.failed++
          results.errors.push({
            email: recipient.email,
            error: 'Failed to send email',
          })
        }
      } catch (error: unknown) {
        results.failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push({
          email: recipient.email,
          error: errorMessage,
        })
        this.payload.logger.error(
          `Error sending campaign email to ${recipient.email}: ${errorMessage}`,
        )
      }
    }

    return results
  }

  /**
   * Отправляет уведомление об обновлении статуса цифрового заказа
   */
  async sendDigitalOrderStatusUpdate(orderTracking: OrderTrackingData): Promise<boolean> {
    try {
      if (!orderTracking.orderId || !orderTracking.status) {
        logError('Missing required fields in order tracking data')
        return false
      }

      // Получаем данные заказа
      const order = await this.payload.findByID({
        collection: 'orders',
        id: orderTracking.orderId.toString(),
        depth: 1,
      })

      if (!order || !order.customer) {
        logError('Order not found or missing customer info')
        return false
      }

      // Получаем email пользователя
      let userEmail
      if (typeof order.customer === 'string') {
        const user = await this.payload.findByID({
          collection: 'users',
          id: order.customer,
        })
        userEmail = user.email
      } else {
        userEmail = order.customer.email
      }

      if (!userEmail) {
        logError('User email not found')
        return false
      }

      // Формируем тему и текст в зависимости от статуса
      let subject = 'Обновление статуса вашего заказа'
      let statusText = 'Обновлен'
      let additionalText = ''

      switch (orderTracking.status) {
        case 'ready_for_download':
          subject = 'Ваш заказ готов к скачиванию'
          statusText = 'Готов к скачиванию'
          additionalText = 'Вы можете скачать приобретенные файлы в личном кабинете.'
          break
        case 'completed':
          subject = 'Ваш заказ завершен'
          statusText = 'Завершен'
          break
        case 'cancelled':
          subject = 'Ваш заказ отменен'
          statusText = 'Отменен'
          break
      }

      // Простой HTML для письма
      const html = `
        <h1>Статус заказа обновлен</h1>
        <p>Ваш заказ #${order.orderNumber || orderTracking.orderId} теперь имеет статус: <strong>${statusText}</strong></p>
        ${additionalText ? `<p>${additionalText}</p>` : ''}
        <p>Спасибо за покупку!</p>
      `

      const result = await this.sendEmail({
        to: userEmail,
        subject,
        html,
      })

      return result
    } catch (error) {
      logError('Failed to send order status update email:', error)
      return false
    }
  }

  /**
   * Отправляет уведомление о новом отчете по проекту
   */
  async sendProjectReportNotificationEmail(data: ProjectReportNotificationEmailData): Promise<boolean> {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'

      // Ensure we have all required data
      const emailData: ProjectReportNotificationEmailData = {
        ...data,
        siteUrl,
      }

      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        EmailTemplateSlug.PROJECT_REPORT_NOTIFICATION,
        data.email,
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(emailData)),
        { locale: data.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      // Fall back to hardcoded template
      const html = generateProjectReportNotificationEmail(emailData)
      const subject =
        data.locale === 'en'
          ? `New Project Report: ${data.projectName}`
          : `Новый отчет по проекту: ${data.projectName}`

      return await this.sendEmail({
        to: data.email,
        subject,
        html,
      })
    } catch (error) {
      logError('Error sending project report notification email:', error)
      return false
    }
  }
}
