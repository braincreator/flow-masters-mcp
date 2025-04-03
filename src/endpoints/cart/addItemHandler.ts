import type { Endpoint } from 'payload/config'
import type { PayloadRequest } from 'payload/types'
import type { Product } from '@/payload-types'
// Убираем Response из express
// import { Response } from 'express'
import { findCartSession } from './cartHelpers' // updateCartPrices не нужен здесь

// POST /api/cart/add
// Убираем res, возвращаем Promise<Response>
const addItemHandler: Endpoint['handler'] = async (req: PayloadRequest): Promise<Response> => {
  const { productId, quantity = 1 } = req.body
  const headers = { 'Content-Type': 'application/json' }

  if (!productId || typeof productId !== 'string') {
    return new Response(JSON.stringify({ message: 'Product ID is required' }), {
      status: 400,
      headers,
    })
  }
  if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    return new Response(JSON.stringify({ message: 'Invalid quantity' }), { status: 400, headers })
  }

  try {
    const payload = req.payload

    // 1. Получить или создать сессию корзины
    // findCartSession теперь принимает только req и возвращает { cartSession, newCookieHeader }
    const { cartSession: cart, newCookieHeader } = await findCartSession(req, true) // Создаем, если нет

    // Добавляем cookie, если он новый
    if (newCookieHeader) {
      headers['Set-Cookie'] = newCookieHeader
    }

    if (!cart) {
      return new Response(JSON.stringify({ message: 'Failed to get or create cart session' }), {
        status: 500,
        headers,
      })
    }

    // 2. Получить информацию о продукте (особенно цену)
    const product = await payload.findByID<Product>({
      collection: 'products',
      id: productId,
      depth: 0, // Нужны только поля верхнего уровня (pricing)
    })

    if (!product?.pricing?.finalPrice) {
      // Упрощенная проверка
      return new Response(JSON.stringify({ message: 'Product not found or price unavailable' }), {
        status: 404,
        headers,
      })
    }
    const price = product.pricing.finalPrice

    // 3. Обновить массив items
    const existingItemIndex = cart.items?.findIndex(
      (item) => (typeof item.product === 'string' ? item.product : item.product?.id) === productId,
    )

    let updatedItems = [...(cart.items || [])]

    if (existingItemIndex > -1) {
      // Обновить количество существующего товара
      updatedItems[existingItemIndex].quantity += quantity
      updatedItems[existingItemIndex].price = price // Обновляем цену на всякий случай
    } else {
      // Добавить новый товар
      updatedItems.push({ product: productId, quantity, price })
    }

    // 4. Обновить CartSession
    const updatedCart = await payload.update({
      collection: 'cart-sessions',
      id: cart.id,
      data: {
        items: updatedItems,
      },
      depth: 1, // Возвращаем обновленную корзину с продуктами
      user: req.user,
      overrideAccess: true,
    })

    // Возвращаем стандартный Response
    return new Response(JSON.stringify(updatedCart), { status: 200, headers })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(`Error adding item (product ${productId}) to cart: ${errorMessage}`)
    // Возвращаем стандартный Response с ошибкой
    return new Response(JSON.stringify({ message: 'Failed to add item to cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }, // Переопределяем headers здесь
    })
  }
}

export default addItemHandler
