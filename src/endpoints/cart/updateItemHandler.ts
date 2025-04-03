import type { Endpoint } from 'payload/config'
import type { PayloadRequest } from 'payload/types'
import type { Product } from '@/payload-types'
// Убираем Response из express
// import { Response } from 'express'
import { findCartSession } from './cartHelpers'

// PATCH /api/cart/update
// Убираем res, возвращаем Promise<Response>
const updateItemHandler: Endpoint['handler'] = async (req: PayloadRequest): Promise<Response> => {
  const { productId, quantity } = req.body
  const headers = { 'Content-Type': 'application/json' }

  if (!productId || typeof productId !== 'string') {
    return new Response(JSON.stringify({ message: 'Product ID is required' }), {
      status: 400,
      headers,
    })
  }
  // Quantity может быть 0 для удаления
  if (
    quantity === undefined ||
    typeof quantity !== 'number' ||
    quantity < 0 ||
    !Number.isInteger(quantity)
  ) {
    return new Response(JSON.stringify({ message: 'Invalid quantity' }), { status: 400, headers })
  }

  try {
    const payload = req.payload

    // 1. Найти существующую корзину (не создавать)
    // findCartSession возвращает { cartSession, newCookieHeader }
    const { cartSession: cart, newCookieHeader } = await findCartSession(req, false)

    // Устанавливаем cookie, если он есть (маловероятно для update, но на всякий случай)
    if (newCookieHeader) {
      headers['Set-Cookie'] = newCookieHeader
    }

    if (!cart) {
      return new Response(JSON.stringify({ message: 'Cart not found' }), { status: 404, headers })
    }

    // 2. Найти индекс товара в корзине
    const itemIndex = cart.items?.findIndex(
      (item) => (typeof item.product === 'string' ? item.product : item.product?.id) === productId,
    )

    if (itemIndex === undefined || itemIndex < 0) {
      return new Response(JSON.stringify({ message: 'Item not found in cart' }), {
        status: 404,
        headers,
      })
    }

    let updatedItems = [...(cart.items || [])]

    // 3. Обновить или удалить товар
    if (quantity === 0) {
      // Удалить товар
      updatedItems.splice(itemIndex, 1)
    } else {
      // Обновить количество и цену
      const product = await payload.findByID<Product>({
        collection: 'products',
        id: productId,
        depth: 0,
      })
      const price = product?.pricing?.finalPrice ?? updatedItems[itemIndex].price

      updatedItems[itemIndex].quantity = quantity
      updatedItems[itemIndex].price = price
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
    req.payload.logger.error(
      `Error updating item (product ${productId}) quantity in cart: ${errorMessage}`,
    )
    // Возвращаем стандартный Response с ошибкой
    return new Response(JSON.stringify({ message: 'Failed to update cart item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default updateItemHandler
 