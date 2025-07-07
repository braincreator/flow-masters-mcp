import { NextRequest } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { cookies } from 'next/headers'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// DELETE /api/cart/remove - удаление товара или услуги из корзины
export async function DELETE(req: NextRequest) {
  try {
    // Получаем данные из тела запроса
    const body = await req.json()
    // Поддержка как старого формата (productId), так и нового (itemId, itemType)
    const { productId, itemId, itemType = 'product' } = body

    // Определяем фактические значения
    const actualItemId = itemId || productId
    const actualItemType = itemId ? itemType : 'product'

    logDebug('Cart remove request received:', {
      productId,
      itemId,
      itemType,
      actualItemId,
      actualItemType,
    })

    if (!actualItemId || typeof actualItemId !== 'string') {
      return Response.json({ message: 'Item ID is required' }, { status: 400 })
    }

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

    if (!cart || !cart.items || !Array.isArray(cart.items)) {
      return Response.json({ message: 'Invalid cart structure' }, { status: 500 })
    }

    // Ищем и удаляем товар или услугу из корзины
    const itemIndex = cart.items.findIndex((item) => {
      if (item.itemType === actualItemType) {
        if (
          actualItemType === 'product' &&
          (typeof item.product === 'string' ? item.product : item.product?.id) === actualItemId
        ) {
          return true
        }
        if (
          actualItemType === 'service' &&
          (typeof item.service === 'string' ? item.service : item.service?.id) === actualItemId
        ) {
          return true
        }
      }
      return false
    })

    if (itemIndex === -1) {
      return Response.json({ message: 'Item not found in cart' }, { status: 404 })
    }

    // Создаем обновленный список элементов без удаляемого элемента
    const updatedItems = [...cart.items]
    updatedItems.splice(itemIndex, 1)

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
    logError('Error removing cart item:', error)
    return Response.json(
      {
        message: 'Failed to remove cart item',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
