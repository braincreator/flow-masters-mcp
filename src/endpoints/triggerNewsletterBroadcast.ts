import { PayloadRequest } from 'payload'
import { Response } from 'express'
import { EmailSetting } from '@/payload-types'
import { EmailService } from '@/services/EmailService'

// Ожидаемый формат тела запроса
interface BroadcastRequestBody {
  title: string
  content: string
  locale?: string // Необязательный параметр локали
}

// Убираем использование отдельного секрета
// const TRIGGER_SECRET = process.env.NEWSLETTER_TRIGGER_SECRET

export default async function triggerNewsletterBroadcastHandler(
  req: PayloadRequest,
  res: Response,
): Promise<Response> {
  // 1. Проверка метода запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // 2. Проверка безопасности (API ключ/секрет из payload.secret)
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.split(' ')[1]
  const payloadSecret = req.payload.secret

  // Проверяем, сконфигурирован ли PAYLOAD_SECRET вообще
  if (!payloadSecret) {
    req.payload.logger.error('PAYLOAD_SECRET is not configured on the server.')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  if (!apiKey || apiKey !== payloadSecret) {
    req.payload.logger.warn(
      'Unauthorized attempt to trigger newsletter broadcast using payload secret.',
    )
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 3. Валидация тела запроса
  const { title, content, locale } = req.body as unknown as BroadcastRequestBody

  if (!title || !content) {
    return res.status(400).json({ error: 'Missing required fields: title and content' })
  }

  // 4. Запуск рассылки через задачу
  try {
    req.payload.logger.info(
      `Enqueueing newsletter broadcast job. Title: "${title}", Locale: ${locale || 'all'}`,
    )

    // Создаем уникальный ID для рассылки
    const broadcastId = `broadcast_${Date.now()}`

    // Получаем EmailService
    const emailService = new EmailService(req.payload)

    // Ставим задачу в очередь
    await req.payload.jobs.queue({
      task: 'newsletter-broadcast',
      input: {
        broadcastId,
        title,
        content,
        locale,
        // SMTP настройки получаются внутри EmailService
      },
    })

    // 5. Успешный ответ
    return res.status(202).json({
      message: 'Newsletter broadcast job enqueued successfully.',
      broadcastId,
    })
  } catch (error: any) {
    req.payload.logger.error(`Error enqueueing newsletter broadcast job: ${error.message}`)
    return res.status(500).json({ error: 'Failed to enqueue job' })
  }
}
