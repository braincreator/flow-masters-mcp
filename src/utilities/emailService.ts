// Здесь импортируем необходимые зависимости для отправки email
// Обычно используется nodemailer или специализированные API (Sendgrid, Mailchimp и т.д.)
import nodemailer from 'nodemailer'
import { getPayloadClient } from './payload'
import { generateNewsletterEmail, NewsletterEmailData } from './emailTemplates/newsletter'

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
  try {
    const { to, subject, html, from = process.env.EMAIL_FROM || 'info@flow-masters.ru' } = options

    const transport = createTransport()

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    })

    // В режиме разработки выводим URL для просмотра письма
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log(`Email sent: ${info.messageId}`)
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Отправляет письмо рассылки подписчику
 */
export const sendNewsletterEmail = async (
  subscriberId: string,
  title: string,
  content: string,
): Promise<boolean> => {
  try {
    const payload = await getPayloadClient()

    // Получаем информацию о подписчике
    const subscriber = await payload.findByID({
      collection: 'newsletter-subscribers',
      id: subscriberId,
    })

    if (!subscriber || subscriber.status !== 'active') {
      console.error(`Cannot send newsletter to subscriber ${subscriberId}: not found or inactive`)
      return false
    }

    // Формируем данные для шаблона
    const emailData: NewsletterEmailData = {
      email: subscriber.email,
      unsubscribeToken: subscriber.unsubscribeToken,
      locale: subscriber.locale || 'ru',
      title,
      content,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
    }

    // Генерируем HTML письма
    const html = generateNewsletterEmail(emailData)

    // Отправляем письмо
    const result = await sendEmail({
      to: subscriber.email,
      subject: title,
      html,
    })

    // Если письмо успешно отправлено, обновляем дату последней отправки
    if (result) {
      await payload.update({
        collection: 'newsletter-subscribers',
        id: subscriberId,
        data: {
          lastSent: new Date().toISOString(),
        },
      })
    }

    return result
  } catch (error) {
    console.error('Error sending newsletter email:', error)
    return false
  }
}

/**
 * Массовая отправка рассылки всем активным подписчикам
 */
export const sendNewsletterToAll = async (
  title: string,
  content: string,
  locale?: string,
): Promise<{ total: number; sent: number; failed: number }> => {
  try {
    const payload = await getPayloadClient()

    // Условия поиска подписчиков
    const where: any = {
      status: {
        equals: 'active',
      },
    }

    // Если указана локаль, фильтруем по ней
    if (locale) {
      where.locale = {
        equals: locale,
      }
    }

    // Получаем всех активных подписчиков
    const subscribers = await payload.find({
      collection: 'newsletter-subscribers',
      where,
      limit: 1000, // Ограничиваем количество подписчиков для одной операции
    })

    let sent = 0
    let failed = 0

    // Отправляем рассылку каждому подписчику
    for (const subscriber of subscribers.docs) {
      const result = await sendNewsletterEmail(subscriber.id, title, content)

      if (result) {
        sent++
      } else {
        failed++
      }

      // Делаем паузу между отправками, чтобы не нагружать сервер
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    return {
      total: subscribers.docs.length,
      sent,
      failed,
    }
  } catch (error) {
    console.error('Error sending newsletter to all subscribers:', error)
    return {
      total: 0,
      sent: 0,
      failed: 0,
    }
  }
}
