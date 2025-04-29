import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { z } from 'zod'

// Схема валидации запроса
const requestSchema = z.object({
  collection: z.string().min(1),
  data: z.record(z.any()),
})

/**
 * Обработчик POST запросов для сохранения лидов
 */
export async function POST(req: NextRequest) {
  try {
    // Парсим и валидируем запрос
    const body = await req.json()
    const validatedData = requestSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validatedData.error.errors,
        },
        { status: 400 },
      )
    }

    const { collection, data } = validatedData.data

    // Получаем клиент Payload
    const payload = await getPayloadClient()

    // Проверяем, существует ли коллекция
    const collections = payload.collections
    const collectionExists = Object.keys(collections).includes(collection)

    if (!collectionExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Collection '${collection}' does not exist`,
        },
        { status: 400 },
      )
    }

    // Добавляем метаданные
    const leadData = {
      ...data,
      createdAt: new Date(),
      source: req.headers.get('referer') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      ip: req.headers.get('x-forwarded-for') || req.ip || 'unknown',
    }

    // Сохраняем данные в коллекцию
    const result = await payload.create({
      collection,
      data: leadData,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error saving lead:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
