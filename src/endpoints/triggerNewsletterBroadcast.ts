import { PayloadRequest, Response } from 'payload'

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
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.split(' ')[1]
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
  const { title, content, locale } = req.body as BroadcastRequestBody

  if (!title || !content) {
    return res.status(400).json({ error: 'Missing required fields: title and content' })
  }

  // 4. Постановка задачи в очередь
  try {
    req.payload.logger.info(
      `Enqueueing newsletter broadcast job. Title: "${title}", Locale: ${locale || 'all'}`,
    )

    await req.payload.enqueueJob({
      jobName: 'newsletter-broadcast', // Имя задачи, определенное в payload.config.ts
      data: {
        title,
        content,
        locale, // Передаем все необходимые данные в задачу
      },
    })

    // 5. Успешный ответ
    return res.status(202).json({ message: 'Newsletter broadcast job enqueued successfully.' })
  } catch (error: any) {
    req.payload.logger.error(`Error enqueueing newsletter broadcast job: ${error.message}`)
    return res.status(500).json({ error: 'Failed to enqueue job' })
  }
}
