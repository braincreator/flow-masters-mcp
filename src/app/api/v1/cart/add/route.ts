import { NextRequest } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Получаем данные из тела запроса
    const body = await req.json()
    const { productId, quantity = 1 } = body

    if (!productId || typeof productId !== 'string') {
      return Response.json({ message: 'Product ID is required' }, { status: 400 })
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

    // Получаем информацию о продукте
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
    })

    if (!product?.pricing?.finalPrice) {
      return Response.json({ message: 'Product not found or price unavailable' }, { status: 404 })
    }

    const price = product.pricing.finalPrice

    // Обновляем массив items
    const existingItemIndex = cart.items?.findIndex(
      (item) => (typeof item.product === 'string' ? item.product : item.product?.id) === productId,
    )

    let updatedItems = [...(cart.items || [])]

    if (existingItemIndex > -1) {
      // Обновить количество существующего товара
      updatedItems[existingItemIndex].quantity += quantity
      updatedItems[existingItemIndex].price = price
    } else {
      // Добавить новый товар
      updatedItems.push({ product: productId, quantity, price })
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
    console.error('Error adding item to cart:', error)
    return Response.json({ message: 'Failed to add item to cart' }, { status: 500 })
  }
}
