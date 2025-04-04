import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

/**
 * Обработчик GET-запроса для отписки от рассылки по токену
 * Используется в письмах для простой отписки по ссылке
 */
export async function GET(request: NextRequest) {
  // Получаем токен из URL
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  try {
    // Инициализируем Payload CMS
    const payload = await getPayloadClient()

    // Ищем подписчика по токену
    const subscribers = await payload.find({
      collection: 'newsletter-subscribers',
      where: {
        unsubscribeToken: {
          equals: token,
        },
        status: {
          not_equals: 'unsubscribed',
        },
      },
    })

    // Если подписчик не найден
    if (subscribers.docs.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found or already unsubscribed' },
        { status: 404 },
      )
    }

    // Обновляем статус подписчика
    const subscriber = subscribers.docs[0]
    await payload.update({
      collection: 'newsletter-subscribers',
      id: subscriber.id,
      data: {
        status: 'unsubscribed',
      },
    })

    // Перенаправляем на страницу подтверждения отписки
    const locale = subscriber.locale || 'ru'
    return NextResponse.redirect(new URL(`/${locale}/unsubscribed`, request.url))
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)

    return NextResponse.json(
      {
        error: 'An error occurred while processing your unsubscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Обработчик POST-запроса для отписки от рассылки по email
 * Используется в случаях, когда пользователь хочет отписаться через форму
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем email из тела запроса
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Инициализируем Payload CMS
    const payload = await getPayloadClient()

    // Ищем подписчика по email
    const subscribers = await payload.find({
      collection: 'newsletter-subscribers',
      where: {
        email: {
          equals: email,
        },
        status: {
          not_equals: 'unsubscribed',
        },
      },
    })

    // Если подписчик не найден
    if (subscribers.docs.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found or already unsubscribed' },
        { status: 404 },
      )
    }

    // Обновляем статус подписчика
    const subscriber = subscribers.docs[0]
    await payload.update({
      collection: 'newsletter-subscribers',
      id: subscriber.id,
      data: {
        status: 'unsubscribed',
      },
    })

    // Возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully',
    })
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)

    return NextResponse.json(
      {
        error: 'An error occurred while processing your unsubscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
