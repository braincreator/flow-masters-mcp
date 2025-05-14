import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayloadClient } from '@/utilities/payload/index'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // Extract cart data from request
    const { sessionId, items, total, currency } = await req.json()

    if (!items || !Array.isArray(items) || !sessionId) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 })
    }

    // Проверяем элементы корзины
    for (const item of items) {
      // Проверка на соответствие структуры элемента
      if (!item.itemType || !['product', 'service'].includes(item.itemType)) {
        return NextResponse.json(
          { error: 'Invalid item type. Must be "product" or "service"' },
          { status: 400 },
        )
      }

      if (
        (item.itemType === 'product' && !item.product) ||
        (item.itemType === 'service' && !item.service)
      ) {
        return NextResponse.json(
          { error: `Missing ${item.itemType} ID in cart item` },
          { status: 400 },
        )
      }

      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
      }
    }

    // Определяем, авторизован ли пользователь
    let user = null
    try {
      // Безопасно пытаемся получить пользователя
      const userReq = { headers: { authorization: req.headers.get('authorization') } }
      // @ts-ignore - verify метод существует в Payload, но не определен в типах
      const userRes = await payload.verify(userReq)
      user = userRes?.user
    } catch (error) {
      // Игнорируем ошибки авторизации - просто считаем пользователя анонимным
    }

    // Try to find existing cart session
    const existingCartSessions = await payload.find({
      collection: 'cart-sessions',
      where: { sessionId: { equals: sessionId } },
      limit: 1,
    })

    const existingCartSession = existingCartSessions.docs[0]

    // Set expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Update or create cart session
    if (existingCartSession) {
      // Skip update if not changed
      const currentItems = existingCartSession.items || []

      // Simple comparison of items (could be more sophisticated)
      const itemsChanged = JSON.stringify(currentItems) !== JSON.stringify(items)

      if (itemsChanged || existingCartSession.total !== total) {
        await payload.update({
          collection: 'cart-sessions',
          id: existingCartSession.id,
          data: {
            user: user?.id || existingCartSession.user,
            sessionId,
            items,
            total,
            currency,
            expiresAt: expiresAt.toISOString(),
            // Only reset reminder status if items have changed
            ...(itemsChanged && {
              reminderSent: false,
              reminderSentAt: null,
            }),
          },
        })
      }
    } else {
      // Create new cart session
      await payload.create({
        collection: 'cart-sessions',
        data: {
          user: user?.id,
          sessionId,
          items,
          total,
          currency,
          expiresAt: expiresAt.toISOString(),
          reminderSent: false,
        },
      })
    }

    // Установка или обновление cookie сессии
    const cookieStore = await cookies()
    await cookieStore.set('payload-cart-session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 дней в секундах
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing cart:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync cart',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
