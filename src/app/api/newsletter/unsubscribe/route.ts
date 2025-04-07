import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service-registry'

/**
 * Обработчик GET-запроса для отписки от рассылки по токену
 * Используется в письмах для простой отписки по ссылке
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  // Проверка наличия токена
  if (!token) {
    return NextResponse.json({ error: 'Missing unsubscribe token' }, { status: 400 })
  }

  console.log(`Unsubscribe attempt with token: ${token}`)

  try {
    const payload = await getPayloadClient()

    // Ищем подписчика по токену
    const { docs: subscribers } = await payload.find({
      collection: 'newsletter-subscribers',
      where: {
        unsubscribeToken: {
          equals: token,
        },
      },
      limit: 1,
    })

    if (subscribers.length === 0) {
      console.warn(`Unsubscribe failed: Token not found - ${token}`)
      // Возвращаем успешный ответ, чтобы не раскрывать информацию о существовании токенов
      // Но можно вернуть и 404, если это предпочтительнее
      return NextResponse.json(
        {
          message:
            'If a subscription exists for this token, it has been processed. Вы будете перенаправлены.',
        },
        { status: 200 },
      )
      // Альтернатива: return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    }

    const subscriber = subscribers[0]

    // Проверяем, не отписан ли уже
    if (subscriber.status === 'unsubscribed') {
      console.log(`Subscriber ${subscriber.email} already unsubscribed.`)
      return NextResponse.json(
        {
          message: 'You are already unsubscribed. Вы будете перенаправлены.',
        },
        { status: 200 },
      )
    }

    // Обновляем статус подписчика
    await payload.update({
      collection: 'newsletter-subscribers',
      id: subscriber.id,
      data: {
        status: 'unsubscribed',
      },
    })

    console.log(`Subscriber ${subscriber.email} unsubscribed successfully.`)

    // Отправляем подтверждение отписки (асинхронно)
    try {
      const serviceRegistry = new ServiceRegistry(payload)
      const emailService = serviceRegistry.getEmailService()

      emailService
        .sendUnsubscribeConfirmationEmail({
          email: subscriber.email,
          locale: subscriber.locale,
        })
        .catch((err) => {
          payload.logger.error(
            `Failed to send unsubscribe confirmation to ${subscriber.email}: ${err.message}`,
          )
        })
    } catch (error: any) {
      payload.logger.error(
        `Error initializing services for unsubscribe confirmation: ${error.message}`,
      )
    }

    // --- Выполняем редирект --- //
    // Получаем локаль подписчика или используем дефолтную
    const redirectLocale = subscriber.locale || 'ru'
    const redirectPath = `/${redirectLocale}/newsletter-unsubscribed`

    // Создаем URL для редиректа, сохраняя исходный хост/порт
    const redirectUrl = new URL(redirectPath, request.url)

    // Добавляем параметры для возможного использования на странице
    redirectUrl.searchParams.set('email', subscriber.email)
    // locale уже будет в пути, но можно добавить и в searchParams при необходимости
    // redirectUrl.searchParams.set('locale', redirectLocale)

    console.log(`Redirecting unsubscribed user to: ${redirectUrl.toString()}`)
    return NextResponse.redirect(redirectUrl)
    // -------------------------- //
  } catch (error: any) {
    console.error(`Error processing unsubscribe token ${token}:`, error)
    // Используем payload.logger, если он доступен
    // payload?.logger?.error(`Error processing unsubscribe token ${token}: ${error.message}`);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 })
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
