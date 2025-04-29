import { NextRequest } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { cookies } from 'next/headers'

// PATCH /api/cart/update - обновление количества товара в корзине
export async function PATCH(req: NextRequest) {
  try {
    // Получаем данные из тела запроса
    const body = await req.json()
    const { productId, quantity } = body

    if (!productId || typeof productId !== 'string') {
      return Response.json({ message: 'Product ID is required' }, { status: 400 })
    }

    if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
      return Response.json({ message: 'Invalid quantity' }, { status: 400 })
    }

    // Если количество 0, вызываем удаление товара через /api/cart/remove/[productId]
    if (quantity === 0) {
      const removeResponse = await fetch(`${req.nextUrl.origin}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: req.headers,
      })

      if (!removeResponse.ok) {
        return Response.json(
          { message: 'Failed to remove item with quantity 0' },
          { status: removeResponse.status },
        )
      }

      return new Response(await removeResponse.text(), {
        status: removeResponse.status,
        headers: removeResponse.headers,
      })
    }

    // Получаем экземпляр Payload
    const payload = await getPayloadClient()

    // Определяем, авторизован ли пользователь
    let user = null
    try {
      // Безопасно пытаемся получить пользователя
      const userReq = { headers: { authorization: req.headers.get('authorization') } }
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
      const cookieStore = cookies()
      const sessionCookie = cookieStore.get('payload-cart-session')
      const sessionId = sessionCookie?.value

      // Если нет cookie сессии, возвращаем ошибку
      if (!sessionId) {
        return Response.json({ message: 'Cart not found' }, { status: 404 })
      }

      where = { sessionId: { equals: sessionId }, convertedToOrder: { not_equals: true } }
    }

    // Ищем существующую сессию корзины
    const result = await payload.find({
      collection: 'cart-sessions',
      where,
      limit: 1,
      depth: 1,
    })

    if (result.docs.length === 0) {
      return Response.json({ message: 'Cart not found' }, { status: 404 })
    }

    const cart = result.docs[0]

    // Обновляем количество товара в корзине
    const itemIndex = cart.items.findIndex(
      (item) => (typeof item.product === 'string' ? item.product : item.product?.id) === productId,
    )

    if (itemIndex === -1) {
      return Response.json({ message: 'Item not found in cart' }, { status: 404 })
    }

    const updatedItems = [...cart.items]
    updatedItems[itemIndex].quantity = quantity

    // Обновляем корзину
    const updatedCart = await payload.update({
      collection: 'cart-sessions',
      id: cart.id,
      data: {
        items: updatedItems,
      },
      depth: 1,
    })

    return Response.json(updatedCart, { status: 200 })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return Response.json({ message: 'Failed to update cart item' }, { status: 500 })
  }
}
