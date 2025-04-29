import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

// Интерфейс для тела запроса
interface SubscribeRequest {
  email: string
  name?: string
  source?: string
  locale?: string
  metadata?: Record<string, any>
}

/**
 * Обработчик POST-запроса для подписки на рассылку
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем данные из тела запроса
    const data: SubscribeRequest = await request.json()

    // Проверяем наличие email
    if (!data.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Инициализируем Payload CMS
    const payload = await getPayloadClient()

    // Проверяем, существует ли уже подписчик с таким email
    const existingSubscribers = await payload.find({
      collection: 'newsletter-subscribers',
      where: {
        email: {
          equals: data.email,
        },
      },
    })

    // Если подписчик существует, обновляем его статус на активный
    if (existingSubscribers.docs.length > 0) {
      const subscriber = existingSubscribers.docs[0]

      // Если подписчик отписан, активируем его заново
      if (subscriber.status === 'unsubscribed') {
        await payload.update({
          collection: 'newsletter-subscribers',
          id: subscriber.id,
          data: {
            status: 'active',
            ...(data.source && { source: data.source }),
            ...(data.locale && { locale: data.locale }),
            ...(data.metadata && { metadata: data.metadata }),
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated successfully',
        })
      }

      // Если подписчик уже активен, возвращаем сообщение об этом
      return NextResponse.json({
        success: true,
        message: 'Already subscribed',
        alreadySubscribed: true,
      })
    }

    // Создаем нового подписчика
    await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        email: data.email,
        name: data.name || '',
        status: 'active',
        source: data.source || 'website',
        locale: data.locale || 'ru',
        metadata: data.metadata || {},
      },
    })

    // Возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
    })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)

    return NextResponse.json(
      {
        error: 'An error occurred while processing your subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
