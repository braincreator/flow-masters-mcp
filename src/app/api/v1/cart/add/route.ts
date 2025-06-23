import { NextRequest } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { cookies } from 'next/headers'
import crypto from 'crypto'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function POST(req: NextRequest) {
  try {
    // Получаем данные из тела запроса
    const body = await req.json()
    const { productId, itemId, itemType = 'product', quantity = 1 } = body

    // Поддержка двух форматов: старого (productId) и нового (itemId, itemType)
    const actualItemId = itemId || productId
    const actualItemType = itemId ? itemType : 'product'

    logDebug('Cart API request received:', {
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

    if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
      return Response.json({ message: 'Invalid quantity' }, { status: 400 })
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

    // Получаем cookie для поиска сессии корзины
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('payload-cart-session')
    const sessionId = sessionCookie?.value

    // Ищем существующую сессию корзины
    let cart

    if (user) {
      // Если пользователь авторизован, ищем по user ID
      const result = await payload.find({
        collection: 'cart-sessions',
        where: { user: { equals: user.id }, convertedToOrder: { not_equals: true } },
        limit: 1,
        sort: '-updatedAt',
        depth: 1,
      })

      if (result.docs.length > 0) {
        cart = result.docs[0]
      }
    } else if (sessionId) {
      // Для анонимных пользователей ищем по sessionId
      const result = await payload.find({
        collection: 'cart-sessions',
        where: { sessionId: { equals: sessionId }, convertedToOrder: { not_equals: true } },
        limit: 1,
        sort: '-updatedAt',
        depth: 1,
      })

      if (result.docs.length > 0) {
        cart = result.docs[0]
      }
    }

    // Если корзина не найдена, создаем новую
    if (!cart) {
      const newSessionId = sessionId || crypto.randomBytes(16).toString('hex')

      const createData = {
        sessionId: newSessionId,
        items: [],
      }

      // Если пользователь авторизован, добавляем его ID к корзине
      if (user) {
        createData.user = user.id
      }

      cart = await payload.create({
        collection: 'cart-sessions',
        data: createData,
        depth: 1,
      })

      // Если это новая сессия для анонимного пользователя, устанавливаем cookie
      if (!sessionId && !user) {
        cookies().set('payload-cart-session', newSessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 дней в секундах
          path: '/',
        })
      }
    }

    let price = 0
    let title = ''

    // Получаем информацию о продукте или услуге
    if (actualItemType === 'product') {
      const product = await payload.findByID({
        collection: 'products',
        id: actualItemId,
        depth: 0,
      })

      if (!product?.pricing?.finalPrice) {
        return Response.json({ message: 'Product not found or price unavailable' }, { status: 404 })
      }

      price = product.pricing.finalPrice
      title = product.title
    } else if (actualItemType === 'service') {
      const service = await payload.findByID({
        collection: 'services',
        id: actualItemId,
        depth: 0,
      })

      if (!service?.price) {
        return Response.json({ message: 'Service not found or price unavailable' }, { status: 404 })
      }

      price = service.price
      title = service.title
    } else {
      return Response.json({ message: 'Invalid item type' }, { status: 400 })
    }

    // Обновляем массив items
    const existingItemIndex = cart.items?.findIndex((item) => {
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

    let updatedItems = [...(cart.items || [])]

    if (existingItemIndex > -1) {
      // Обновить количество существующего товара
      updatedItems[existingItemIndex].quantity += quantity
      // Price snapshot может быть обновлен при желании
      // updatedItems[existingItemIndex].priceSnapshot = price
    } else {
      // Добавить новый товар
      const newItem = {
        itemType: actualItemType,
        quantity,
        priceSnapshot: price,
        titleSnapshot: title,
      }

      if (actualItemType === 'product') {
        newItem.product = actualItemId
      } else {
        newItem.service = actualItemId
      }

      updatedItems.push(newItem)
    }

    // Обновляем CartSession
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
    logError('Error adding item to cart:', error)
    return Response.json({ message: 'Failed to add item to cart' }, { status: 500 })
  }
}
