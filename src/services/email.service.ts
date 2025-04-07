import type { Payload } from 'payload'
import { BaseService } from './base.service'
import nodemailer from 'nodemailer'
import {
  generateNewsletterEmail,
  NewsletterEmailData,
} from '../utilities/emailTemplates/newsletter'
import { generateWelcomeEmail, WelcomeEmailData } from '../utilities/emailTemplates/welcome'
import {
  generateUnsubscribeConfirmationEmail,
  UnsubscribeConfirmationEmailData,
} from '../utilities/emailTemplates/unsubscribeConfirmation'
import {
  generateAdminNewSubscriberNotificationEmail,
  AdminNewSubscriberNotificationEmailData,
} from '../utilities/emailTemplates/adminNewSubscriber'

// Интерфейс для опций отправки письма
interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
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

    // Проверка наличия необходимых переменных окружения
    if (
      process.env.NODE_ENV === 'production' &&
      (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD)
    ) {
      console.error('SMTP configuration is missing for production environment!')
    }

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
      const settings = (await this.payload.findGlobal({
        slug: 'email-settings',
      })) as EmailSettingsType

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
        from: settings.smtp.from || 'no-reply@flow-masters.ru',
      }
    } catch (error) {
      console.error('Failed to get email settings:', error)
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
        console.error(
          "Email 'from' address is not configured (EMAIL_FROM environment variable) and no default provided.",
        )
        return false
      }

      const transport = this.createTransport()
      console.log(
        `Attempting to send email. From: ${fromAddress}, To: ${to}, Subject: \"${subject}\"`,
      )

      const info = await transport.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      })

      // В режиме разработки выводим URL для просмотра письма
      if (process.env.NODE_ENV !== 'production' && info.messageId) {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
      }

      console.log(
        `Email successfully sent. To: ${to}, Subject: \"${subject}\", Message ID: ${info.messageId}`,
      )
      return true
    } catch (error) {
      console.error(
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
    } catch (error: any) {
      this.payload.logger.error(
        `Error sending newsletter email to subscriber ${subscriberId}: ${error.message}`,
      )
      return { success: false, error: error.message || 'Unknown error' }
    }
  }

  /**
   * Отправляет письмо рассылки всем подписчикам с учетом локали
   */
  async sendBroadcast(
    title: string,
    content: string,
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
    // Используем переданные настройки SMTP или получаем из базы
    const emailSettings = customSmtpSettings || (await this.getEmailSettings())
    const transporter = this.createTransport(emailSettings)

    // Получаем всех подписчиков
    const subscribers = await this.payload.find({
      collection: 'newsletter-subscribers',
      where: {
        ...(locale ? { locale: { equals: locale } } : {}),
        confirmed: { equals: true },
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
      } catch (error: any) {
        results.failedToSend++
        results.sendErrors.push({
          error: `Failed to send to ${subscriber.email}: ${error.message}`,
        })
        this.payload.logger.error(`Failed to send newsletter email to ${subscriber.email}`)
      }
    }

    return results
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
      console.error('Failed to send welcome email:', error)
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
      console.error('Failed to send unsubscribe confirmation email:', error)
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
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@flow-masters.ru'

      const emailData: AdminNewSubscriberNotificationEmailData = {
        ...subscriberData,
        adminEmail,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
      }

      const html = generateAdminNewSubscriberNotificationEmail(emailData)

      const result = await this.sendEmail({
        to: adminEmail,
        subject: 'Новый подписчик на рассылку',
        html,
      })

      return result
    } catch (error) {
      console.error('Failed to send admin notification email:', error)
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
      console.error('Failed to send payment confirmation email:', error)
      return false
    }
  }

  /**
   * Отправляет уведомление об обновлении статуса цифрового заказа
   */
  async sendDigitalOrderStatusUpdate(orderTracking: any): Promise<boolean> {
    try {
      if (!orderTracking.orderId || !orderTracking.status) {
        console.error('Missing required fields in order tracking data')
        return false
      }

      // Получаем данные заказа
      const order = await this.payload.findByID({
        collection: 'orders',
        id: orderTracking.orderId.toString(),
        depth: 1,
      })

      if (!order || !order.customer) {
        console.error('Order not found or missing customer info')
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
        console.error('User email not found')
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
      console.error('Failed to send order status update email:', error)
      return false
    }
  }
}
