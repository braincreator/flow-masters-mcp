import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index' // Убедитесь, что путь верный
import { z } from 'zod'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Схема валидации для входящих данных (должна совпадать с фронтендом)
const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  let payload

  try {
    // 1. Получаем и валидируем данные из запроса
    const body = await req.json()
    const validationResult = contactFormSchema.safeParse(body)

    if (!validationResult.success) {
      logError('[Contact API] Invalid data:', validationResult.error.flatten())
      return NextResponse.json(
        { error: 'Неверные данные формы.', details: validationResult.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, email, subject, message } = validationResult.data

    // 2. Инициализируем Payload клиент
    try {
      payload = await getPayloadClient()
      logDebug('[Contact API] Payload client initialized')
    } catch (payloadError) {
      logError('[Contact API] Failed to initialize Payload client:', payloadError)
      return NextResponse.json(
        {
          error: 'Ошибка подключения к базе данных.',
          details: payloadError instanceof Error ? payloadError.message : 'Unknown error',
        },
        { status: 500 },
      )
    }

    // 3. Создаем запись в коллекции 'messages'
    try {
      logDebug('[Contact API] Attempting to create message entry...')
      const newMessage = await payload.create({
        collection: 'messages',
        data: {
          name,
          email,
          subject: subject || 'Без темы', // Используем значение по умолчанию, если тема пуста
          message,
          source: 'Contact Form', // Источник сообщения
        },
      })
      logDebug('[Contact API] Message created successfully:', newMessage.id)

      // Опционально: можно отправить email-уведомление администратору здесь

      return NextResponse.json({ success: true, message: 'Сообщение успешно отправлено.' })
    } catch (createError) {
      logError('[Contact API] Error creating message:', createError)
      return NextResponse.json(
        {
          error: 'Не удалось сохранить сообщение.',
          details: createError instanceof Error ? createError.message : 'Unknown error',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    // Общая обработка ошибок (например, если req.json() упадет)
    logError('[Contact API] Unhandled error:', error)
    return NextResponse.json(
      {
        error: 'Произошла внутренняя ошибка сервера.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// Запрещаем другие методы для этого роута
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
// ... добавьте OPTIONS, PUT, DELETE и т.д., если нужно явно запретить
