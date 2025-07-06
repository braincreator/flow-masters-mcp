import { NextRequest } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { cookies } from 'next/headers'
import { Product, Service } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type CartItem = {
  itemType: 'product' | 'service'
  product?: string | Product | null
  service?: string | Service | null
  quantity: number
  priceSnapshot: number
  titleSnapshot?: string | null
  id?: string | null
}

// PATCH /api/v1/cart/update - обновление количества товара или услуги в корзине
export async function PATCH(req: NextRequest) {
  try {
    // Получаем данные из тела запроса
    const body = await req.json()
    // Поддержка как старого формата (productId), так и нового (itemId, itemType)
    const { productId, itemId, itemType = 'product', quantity } = body

    // Определяем фактические значения
    const actualItemId = itemId || productId
    const actualItemType = itemId ? itemType : 'product'

    logDebug('Cart update request received:', {
      productId,
      itemId,
      itemType,
      quantity,
      actualItemId,
      actualItemType,
    })

    if (!actualItemId || typeof actualItemId !== 'string') {
      return Response.json({ message: 'Item ID is required' }, { status: 400 })
    }

    if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
      return Response.json({ message: 'Invalid quantity' }, { status: 400 })
    }

    // Если количество 0, вызываем удаление товара через /api/cart/remove
    if (quantity === 0) {
      const removeResponse = await fetch(`${req.nextUrl.origin}/api/v1/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...req.headers,
        },
        body: JSON.stringify({ itemId: actualItemId, itemType: actualItemType }),
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

    // Обновляем количество товара или услуги в корзине
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

    // Создаем копию элемента для обновления
    const originalItem = cart.items[itemIndex]

    if (!originalItem) {
      return Response.json({ message: 'Invalid item in cart' }, { status: 500 })
    }

    // Создаем обновленный элемент с сохранением всех полей и обновлением quantity
    const updatedItem: CartItem = {
      itemType: originalItem.itemType as 'product' | 'service',
      quantity,
      product: originalItem.product,
      service: originalItem.service,
      priceSnapshot: originalItem.priceSnapshot || 0,
      titleSnapshot: originalItem.titleSnapshot,
      id: originalItem.id,
    }

    // Создаем обновленный список элементов
    const updatedItems = [...cart.items]
    updatedItems[itemIndex] = updatedItem

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
    logError('Error updating cart item:', error)
    return Response.json(
      {
        message: 'Failed to update cart item',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
