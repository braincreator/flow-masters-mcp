import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { formatChatHistory, sanitizeMessage, containsProhibitedContent } from '@/utilities/chat'

// Схема валидации запроса
const requestSchema = z
  .object({
    message: z.string().min(1).max(1000),
    // Поддерживаем оба варианта названия поля
    webhookUrl: z.string().url().optional(),
    n8nWebhookUrl: z.string().url().optional(),
    webhookSecret: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    history: z.array(z.any()).optional(),
  })
  .refine((data) => data.webhookUrl || data.n8nWebhookUrl, {
    message: 'Требуется указать webhookUrl или n8nWebhookUrl',
    path: ['webhookUrl'],
  })

export async function POST(req: NextRequest) {
  try {
    // Парсим и валидируем запрос
    const body = await req.json()
    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Неверный формат запроса',
          details: validationResult.error.format(),
        },
        { status: 400 },
      )
    }

    // Используем webhookUrl или n8nWebhookUrl, в зависимости от того, что пришло
    const {
      message,
      webhookUrl: url1,
      n8nWebhookUrl: url2,
      webhookSecret,
      metadata,
      history,
    } = validationResult.data
    const webhookUrl = url1 || url2

    // Проверяем сообщение на запрещенный контент
    if (containsProhibitedContent(message)) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Сообщение содержит запрещенный контент',
        },
        { status: 400 },
      )
    }

    // Санитизируем сообщение
    const sanitizedMessage = sanitizeMessage(message)

    // Форматируем историю чата, если она есть
    const formattedHistory = history ? formatChatHistory(history) : []

    // Подготавливаем данные для отправки на сервер
    const payload = {
      message: sanitizedMessage,
      history: formattedHistory,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'chat-block',
        ...metadata,
      },
    }

    // Настраиваем заголовки для запроса
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Добавляем секретный ключ, если он указан
    if (webhookSecret) {
      headers['x-webhook-secret'] = webhookSecret
    }

    // Отправляем запрос на вебхук
    let responseData
    try {
      // Проверяем, что URL вебхука существует
      if (!webhookUrl) {
        throw new Error('Не указан URL вебхука')
      }

      console.log(`Отправка запроса на webhook: ${webhookUrl}`)

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      // Проверяем ответ от вебхука
      if (!webhookResponse.ok) {
        console.error(`Ошибка от вебхука: ${webhookResponse.status} ${webhookResponse.statusText}`)

        // Добавляем больше информации в ответ для отладки
        return NextResponse.json(
          {
            status: 'error',
            error: `Ошибка от вебхука: ${webhookResponse.status} ${webhookResponse.statusText}`,
            details: {
              webhookUrl: webhookUrl ? webhookUrl.replace(/\/\w+$/, '/***') : 'undefined', // Маскируем часть URL для безопасности
              timestamp: new Date().toISOString(),
            },
          },
          { status: 502 },
        )
      }

      // Парсим ответ от вебхука
      responseData = await webhookResponse.json()
    } catch (error) {
      // Обрабатываем ошибки сети и другие исключения
      console.error('Ошибка при подключении к вебхуку:', error)

      return NextResponse.json(
        {
          status: 'error',
          error: 'Не удалось подключиться к вебхуку',
          message: error instanceof Error ? error.message : 'Неизвестная ошибка сети',
          details: {
            webhookUrl: webhookUrl ? webhookUrl.replace(/\/\w+$/, '/***') : 'undefined', // Маскируем часть URL для безопасности
            timestamp: new Date().toISOString(),
          },
        },
        { status: 502 },
      )
    }
    console.log('Ответ от вебхука:', responseData)

    // Определяем типы для наших данных
    type MessageButton = {
      id: string
      text: string
      value: string
      action?: string
      url?: string
      style?: string
    }

    type MessageQuickReply = {
      id: string
      text: string
      value: string
    }

    type MessageCard = {
      title: string
      subtitle?: string
      imageUrl?: string
      buttons?: MessageButton[]
      footer?: string
    }

    type MessageMedia = {
      type: 'image' | 'video' | 'audio' | 'file'
      url: string
      thumbnailUrl?: string
      altText?: string
      fileName?: string
      fileSize?: number
      mimeType?: string
      width?: number
      height?: number
      duration?: number
    }

    type ChatResponse = {
      response?: string
      metadata?: Record<string, unknown>
      type?: string
      media?: MessageMedia
      card?: MessageCard
      buttons?: MessageButton[]
      quickReplies?: MessageQuickReply[]
    }

    // Функция для извлечения JSON из markdown code block
    const extractJsonFromMarkdown = (text: unknown): ChatResponse | unknown => {
      // Проверяем, является ли текст строкой
      if (typeof text !== 'string') {
        return text
      }

      // Ищем JSON внутри markdown code block
      const jsonRegex = /```(?:json)?\n([\s\S]*?)\n```/
      const match = text.match(jsonRegex)

      if (match && match[1]) {
        try {
          // Пытаемся распарсить JSON
          return JSON.parse(match[1])
        } catch (e) {
          console.error('Ошибка при парсинге JSON из markdown:', e)
          // Возвращаем оригинальный текст, если не удалось распарсить
          return text
        }
      }

      // Если не нашли markdown code block, возвращаем исходный текст
      return text
    }

    // Обрабатываем ответ от вебхука
    let processedData: ChatResponse = {}

    // Проверяем, есть ли поле output и является ли оно строкой с markdown
    if (responseData.output && typeof responseData.output === 'string') {
      // Пытаемся извлечь JSON из markdown
      const extracted = extractJsonFromMarkdown(responseData.output)
      if (typeof extracted === 'object' && extracted !== null) {
        processedData = extracted as ChatResponse
      } else {
        // Если не удалось извлечь JSON, используем текст как ответ
        processedData = { response: String(extracted), type: 'text' }
      }
    } else if (responseData.output && typeof responseData.output === 'object') {
      // Если output уже является объектом, используем его
      processedData = responseData.output as ChatResponse
    } else {
      // Используем сам responseData, если нет поля output
      processedData = responseData as unknown as ChatResponse
    }

    console.log('Обработанные данные:', processedData)

    // Возвращаем ответ клиенту
    return NextResponse.json({
      status: 'success',
      response: processedData.response || 'Получен ответ без содержимого',
      metadata: processedData.metadata || {},
      type: processedData.type || 'text',
      media: processedData.media,
      card: processedData.card,
      buttons: processedData.buttons,
      quickReplies: processedData.quickReplies,
    })
  } catch (error) {
    console.error('Ошибка при обработке запроса chat:', error)

    return NextResponse.json(
      {
        status: 'error',
        error: 'Внутренняя ошибка сервера',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    )
  }
}

// Запрещаем другие методы для этого роута
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
