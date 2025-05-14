import { NextRequest } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { cookies } from 'next/headers'

// GET /api/v1/cart - получение корзины
export async function GET(req: NextRequest) {
  try {
    // Получаем экземпляр Payload
    const payload = await getPayloadClient()

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

    // Определяем, какую корзину искать
    let where = {}

    if (user) {
      // Для авторизованного пользователя ищем по user ID
      where = { user: { equals: user.id }, convertedToOrder: { not_equals: true } }
    } else {
      // Для анонимного пользователя ищем по sessionId из cookie
      const cookieStore = await cookies()
      const sessionId = (await cookieStore.get('payload-cart-session'))?.value

      // Если нет cookie сессии, возвращаем пустую корзину
      if (!sessionId) {
        return Response.json(null, { status: 200 })
      }

      where = { sessionId: { equals: sessionId }, convertedToOrder: { not_equals: true } }
    }

    // Ищем существующую сессию корзины
    const result = await payload.find({
      collection: 'cart-sessions',
      where,
      limit: 1,
      sort: '-updatedAt',
      depth: 2, // Увеличиваем глубину для получения информации о продуктах и услугах
    })

    if (result.docs.length === 0) {
      return Response.json(null, { status: 200 })
    }

    // Возвращаем найденную корзину
    return Response.json(result.docs[0], { status: 200 })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return Response.json(
      {
        message: 'Failed to retrieve cart',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// DELETE /api/v1/cart - очистка корзины
export async function DELETE(req: NextRequest) {
  try {
    // Получаем экземпляр Payload
    const payload = await getPayloadClient()

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

    // Определяем, какую корзину искать
    let where = {}

    if (user) {
      // Для авторизованного пользователя ищем по user ID
      where = { user: { equals: user.id }, convertedToOrder: { not_equals: true } }
    } else {
      // Для анонимного пользователя ищем по sessionId из cookie
      const cookieStore = await cookies()
      const sessionId = (await cookieStore.get('payload-cart-session'))?.value

      // Если нет cookie сессии, нечего очищать
      if (!sessionId) {
        return Response.json({ success: true }, { status: 200 })
      }

      where = { sessionId: { equals: sessionId }, convertedToOrder: { not_equals: true } }
    }

    // Ищем существующую сессию корзины
    const result = await payload.find({
      collection: 'cart-sessions',
      where,
      limit: 1,
    })

    if (result.docs.length === 0) {
      return Response.json({ success: true }, { status: 200 })
    }

    // Обновляем корзину, очищая items
    await payload.update({
      collection: 'cart-sessions',
      id: result.docs[0].id,
      data: {
        items: [],
      },
    })

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return Response.json(
      {
        message: 'Failed to clear cart',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
