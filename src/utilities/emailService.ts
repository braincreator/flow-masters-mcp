// Здесь импортируем необходимые зависимости для отправки email
// Обычно используется nodemailer или специализированные API (Sendgrid, Mailchimp и т.д.)
import nodemailer from 'nodemailer'
import { getPayloadClient } from './payload'
import { generateNewsletterEmail, NewsletterEmailData } from './emailTemplates/newsletter'
import { generateWelcomeEmail, WelcomeEmailData } from './emailTemplates/welcome'
import {
  generateUnsubscribeConfirmationEmail,
  UnsubscribeConfirmationEmailData,
} from './emailTemplates/unsubscribeConfirmation'
import {
  generateAdminNewSubscriberNotificationEmail,
  AdminNewSubscriberNotificationEmailData,
} from './emailTemplates/adminNewSubscriber'
import { Payload } from 'payload'
import { NewsletterSubscriber } from '@/payload-types'

// Интерфейс для опций отправки письма
interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Создает транспорт для nodemailer в зависимости от окружения
 * (разработка или продакшн)
 */
const createTransport = () => {
  // Проверка наличия необходимых переменных окружения
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD)
  ) {
    console.error('SMTP configuration is missing for production environment!')
    // Можно выбросить ошибку или вернуть специальное значение
    // throw new Error('SMTP configuration is missing');
  }
  // Проверка Ethereal
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.ETHEREAL_USER || !process.env.ETHEREAL_PASSWORD) {
      console.warn('Ethereal credentials missing for development, using default test account.')
      // Установка значений по умолчанию, если они не заданы
      process.env.ETHEREAL_USER = process.env.ETHEREAL_USER || 'maddison53@ethereal.email' // Пример Ethereal аккаунта
      process.env.ETHEREAL_PASSWORD = process.env.ETHEREAL_PASSWORD || 'NPSsxSKARzXTmLjLPD' // Пароль к нему
    }
  }

  // В продакшне используем настоящий SMTP-сервер
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  // В среде разработки используем тестовый аккаунт
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'ethereal_pass',
    },
  })
}

/**
 * Отправляет email с заданными параметрами
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  // Возвращаем значение по умолчанию для EMAIL_FROM и проверяем его наличие
  const fromAddress = options.from || process.env.EMAIL_FROM || 'info@flow-masters.ru'
  const { to, subject, html } = options

  try {
    if (!fromAddress) {
      console.error(
        "Email 'from' address is not configured (EMAIL_FROM environment variable) and no default provided.",
      )
      return false
    }

    const transport = createTransport()
    console.log(
      `Attempting to send email. From: ${fromAddress}, To: ${to}, Subject: \"${subject}\"`,
    ) // Логирование попытки отправки

    const info = await transport.sendMail({
      from: fromAddress, // Используем проверенный адрес
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
    ) // Логирование успеха
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
 * Отправляет письмо рассылки подписчику (с использованием payload.logger)
 */
export const sendNewsletterEmailWithLogging = async (
  payload: Payload,
  subscriberId: string,
  title: string,
  content: string,
): Promise<{ success: boolean; email?: string; error?: string }> => {
  try {
    const subscriber = await payload.findByID({
      collection: 'newsletter-subscribers',
      id: subscriberId,
    })

    if (!subscriber || subscriber.status !== 'active') {
      const reason = !subscriber ? 'not found' : 'inactive'
      payload.logger.warn(`Cannot send newsletter to subscriber ${subscriberId}: ${reason}`)
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

    const result = await sendEmail({
      to: subscriber.email,
      subject: title, // Используем переданный title
      html,
    })

    if (result) {
      await payload.update({
        collection: 'newsletter-subscribers',
        id: subscriberId,
        data: {
          lastSent: new Date().toISOString(),
        },
      })
      payload.logger.info(`Newsletter email sent successfully to ${subscriber.email}`)
      return { success: true, email: subscriber.email }
    } else {
      payload.logger.error(`Failed to send newsletter email to ${subscriber.email}`)
      return { success: false, email: subscriber.email, error: 'Send email function failed' }
    }
  } catch (error: any) {
    payload.logger.error(
      `Error sending newsletter email to subscriber ${subscriberId}: ${error.message}`,
    )
    return { success: false, error: error.message || 'Unknown error' }
  }
}

// Интерфейс для результата массовой рассылки
export interface SendToAllResult {
  totalSubscribers: number
  successfullySent: number
  failedToSend: number
  sendErrors: Array<{ email?: string; error: string }>
}

/**
 * Массовая отправка рассылки всем активным подписчикам с пагинацией.
 * Предназначена для использования внутри фоновой задачи.
 */
export const sendNewsletterToAllPaginated = async (
  payload: Payload,
  title: string,
  content: string,
  locale?: string,
): Promise<SendToAllResult> => {
  payload.logger.info(
    `Starting newsletter broadcast. Title: "${title}", Locale: ${locale || 'all'}`,
  )

  const results: SendToAllResult = {
    totalSubscribers: 0,
    successfullySent: 0,
    failedToSend: 0,
    sendErrors: [],
  }

  let page = 1
  const limit = 100 // Обрабатываем по 100 подписчиков за раз
  let hasMore = true

  while (hasMore) {
    payload.logger.info(`Fetching page ${page} of subscribers...`)
    try {
      const where: any = {
        status: {
          equals: 'active',
        },
      }
      if (locale) {
        where.locale = {
          equals: locale,
        }
      }

      const subscribersPage = await payload.find({
        collection: 'newsletter-subscribers',
        where,
        page,
        limit,
        depth: 0, // Нам не нужны связанные данные
      })

      if (page === 1) {
        results.totalSubscribers = subscribersPage.totalDocs
        payload.logger.info(`Total active subscribers found: ${results.totalSubscribers}`)
      }

      if (subscribersPage.docs.length === 0) {
        payload.logger.info('No more subscribers found.')
        hasMore = false
        break
      }

      payload.logger.info(
        `Processing ${subscribersPage.docs.length} subscribers from page ${page}...`,
      )

      for (const subscriber of subscribersPage.docs) {
        const result = await sendNewsletterEmailWithLogging(payload, subscriber.id, title, content)

        if (result.success) {
          results.successfullySent++
        } else {
          results.failedToSend++
          results.sendErrors.push({ email: result.email, error: result.error || 'Unknown error' })
        }
        // Небольшая пауза, чтобы не перегружать SMTP сервер
        await new Promise((resolve) => setTimeout(resolve, 150))
      }

      hasMore = subscribersPage.hasNextPage
      page = subscribersPage.nextPage ?? page + 1

      if (hasMore) {
        payload.logger.info(`Moving to page ${page}...`)
      }
    } catch (error: any) {
      payload.logger.error(
        `Error fetching or processing subscribers on page ${page}: ${error.message}`,
      )
      results.sendErrors.push({ error: `Failed to process page ${page}: ${error.message}` })
      // Решаем прервать процесс при ошибке получения данных
      hasMore = false
    }
  }

  payload.logger.info(
    `Newsletter broadcast finished. Total: ${results.totalSubscribers}, Sent: ${results.successfullySent}, Failed: ${results.failedToSend}`,
  )
  if (results.failedToSend > 0) {
    payload.logger.warn(`Encountered ${results.failedToSend} errors during broadcast:`)
    results.sendErrors.forEach((err) => payload.logger.warn(`- ${err.email || '?'}: ${err.error}`))
  }

  return results
}

/**
 * Отправляет приветственное письмо новому подписчику
 */
export const sendWelcomeEmail = async (
  subscriberData: Pick<WelcomeEmailData, 'email' | 'name' | 'locale' | 'unsubscribeToken'>,
): Promise<boolean> => {
  try {
    const { email, name, locale, unsubscribeToken } = subscriberData
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

    return await sendEmail({
      to: email,
      subject,
      html,
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}

/**
 * Отправляет письмо с подтверждением отписки
 */
export const sendUnsubscribeConfirmationEmail = async (
  subscriberData: Pick<UnsubscribeConfirmationEmailData, 'email' | 'locale'>,
): Promise<boolean> => {
  try {
    const { email, locale } = subscriberData
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'

    const emailData: UnsubscribeConfirmationEmailData = {
      email,
      locale: locale || 'ru',
      siteUrl,
    }

    const html = generateUnsubscribeConfirmationEmail(emailData)
    const subject =
      locale === 'ru' ? 'Вы отписались от рассылки Flow Masters' : 'You have unsubscribed'

    return await sendEmail({
      to: email,
      subject,
      html,
    })
  } catch (error) {
    console.error('Error sending unsubscribe confirmation email:', error)
    return false
  }
}

/**
 * Отправляет уведомление администратору о новом подписчике
 */
export const sendAdminNewSubscriberNotification = async (
  subscriberData: Pick<
    AdminNewSubscriberNotificationEmailData,
    'newSubscriberEmail' | 'newSubscriberName'
  >,
): Promise<boolean> => {
  // Сначала проверяем наличие email администратора
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM // Email админа
  if (!adminEmail) {
    console.warn(
      'Admin email (ADMIN_EMAIL or EMAIL_FROM) not configured, skipping admin notification.',
    )
    return false // Возвращаем false, если email не найден
  }

  // Теперь основной блок try/catch для отправки
  try {
    const emailData: AdminNewSubscriberNotificationEmailData = {
      ...subscriberData,
      // Значения по умолчанию гарантируют передачу строк
      adminPanelUrl: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000/admin',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
    }

    const html = generateAdminNewSubscriberNotificationEmail(emailData)
    const subject = 'Новый подписчик на Flow Masters'

    // Вызываем sendEmail - она вернет true или false
    return await sendEmail({
      to: adminEmail, // Мы уверены, что это string после проверки выше
      subject,
      html,
    })
  } catch (error) {
    // sendEmail уже логирует детали ошибки, здесь можно добавить общий контекст
    console.error('Failed to execute sendAdminNewSubscriberNotification:', error)
    return false // Возвращаем false в случае любой ошибки
  }
}
