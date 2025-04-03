import { NextRequest } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { cookies } from 'next/headers'

// DELETE /api/cart/remove/[productId] - удаление товара из корзины
export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params

    if (!productId) {
      return Response.json({ message: 'Product ID is required' }, { status: 400 })
    }

    // Получаем экземпляр Payload
    const payload = await getPayloadClient()

    // Определяем, авторизован ли пользователь
    let user = null;
    try {
      // Безопасно пытаемся получить пользователя
      const userReq = { headers: { authorization: req.headers.get('authorization') } };
      const userRes = await payload.verify(userReq);
      user = userRes?.user;
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

    // Удаляем товар из корзины
    const updatedItems = cart.items.filter(
      (item) => (typeof item.product === 'string' ? item.product : item.product?.id) !== productId,
    )

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
    console.error('Error removing item from cart:', error)
    return Response.json({ message: 'Failed to remove item from cart' }, { status: 500 })
  }
}
