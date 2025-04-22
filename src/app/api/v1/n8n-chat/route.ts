import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { formatChatHistory, sanitizeMessage, containsProhibitedContent } from '@/utilities/chat'

// Схема валидации запроса
const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  webhookUrl: z.string().url(),
  webhookSecret: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  history: z.array(z.any()).optional(),
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

    const { message, webhookUrl, webhookSecret, metadata, history } = validationResult.data

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

    // Подготавливаем данные для отправки в n8n
    const payload = {
      message: sanitizedMessage,
      history: formattedHistory,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'n8n-chat-demo',
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

    // Отправляем запрос в n8n
    let n8nData
    try {
      console.log(`Отправка запроса на webhook: ${webhookUrl}`)

      const n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      // Проверяем ответ от n8n
      if (!n8nResponse.ok) {
        console.error(`Ошибка от n8n: ${n8nResponse.status} ${n8nResponse.statusText}`)

        // Добавляем больше информации в ответ для отладки
        return NextResponse.json(
          {
            status: 'error',
            error: `Ошибка от n8n: ${n8nResponse.status} ${n8nResponse.statusText}`,
            details: {
              webhookUrl: webhookUrl.replace(/\/\w+$/, '/***'), // Маскируем часть URL для безопасности
              timestamp: new Date().toISOString(),
            },
          },
          { status: 502 },
        )
      }

      // Парсим ответ от n8n
      n8nData = await n8nResponse.json()
    } catch (error) {
      // Обрабатываем ошибки сети и другие исключения
      console.error('Ошибка при подключении к n8n:', error)

      return NextResponse.json(
        {
          status: 'error',
          error: 'Не удалось подключиться к n8n',
          message: error instanceof Error ? error.message : 'Неизвестная ошибка сети',
          details: {
            webhookUrl: webhookUrl.replace(/\/\w+$/, '/***'), // Маскируем часть URL для безопасности
            timestamp: new Date().toISOString(),
          },
        },
        { status: 502 },
      )
    }
    console.log('Ответ от n8n:', n8nData)

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

    // Обрабатываем ответ от n8n
    let processedData: ChatResponse = {}

    // Проверяем, есть ли поле output и является ли оно строкой с markdown
    if (n8nData.output && typeof n8nData.output === 'string') {
      // Пытаемся извлечь JSON из markdown
      const extracted = extractJsonFromMarkdown(n8nData.output)
      if (typeof extracted === 'object' && extracted !== null) {
        processedData = extracted as ChatResponse
      } else {
        // Если не удалось извлечь JSON, используем текст как ответ
        processedData = { response: String(extracted), type: 'text' }
      }
    } else if (n8nData.output && typeof n8nData.output === 'object') {
      // Если output уже является объектом, используем его
      processedData = n8nData.output as ChatResponse
    } else {
      // Используем сам n8nData, если нет поля output
      processedData = n8nData as unknown as ChatResponse
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
    console.error('Ошибка при обработке запроса n8n-chat:', error)

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
