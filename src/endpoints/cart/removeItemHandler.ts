import type { Endpoint } from 'payload/config'
import type { PayloadRequest } from 'payload/types'
// Убираем Response из express
// import { Response } from 'express'
import { findCartSession } from './cartHelpers'

// DELETE /api/cart/remove/:productId
// Убираем res, возвращаем Promise<Response>
const removeItemHandler: Endpoint['handler'] = async (req: PayloadRequest): Promise<Response> => {
  const productId = req.params.productId // Получаем ID из параметра пути
  const headers = { 'Content-Type': 'application/json' }

  if (!productId || typeof productId !== 'string') {
    return new Response(JSON.stringify({ message: 'Product ID parameter is required' }), {
      status: 400,
      headers,
    })
  }

  try {
    const payload = req.payload

    // 1. Найти существующую корзину
    const { cartSession: cart, newCookieHeader } = await findCartSession(req, false)

    // Устанавливаем cookie, если он есть
    if (newCookieHeader) {
      headers['Set-Cookie'] = newCookieHeader
    }

    if (!cart) {
      // Если корзины нет, считаем операцию успешной (товара и так нет)
      return new Response(JSON.stringify(null), { status: 200, headers }) // Возвращаем null
    }

    // 2. Отфильтровать массив items, удалив нужный товар
    const initialItemCount = cart.items?.length || 0
    const updatedItems = (cart.items || []).filter(
      (item) => (typeof item.product === 'string' ? item.product : item.product?.id) !== productId,
    )

    // 3. Если массив изменился, обновить CartSession
    if (updatedItems.length < initialItemCount) {
      const updatedCart = await payload.update({
        collection: 'cart-sessions',
        id: cart.id,
        data: {
          items: updatedItems,
        },
        depth: 1, // Возвращаем обновленную корзину
        user: req.user,
        overrideAccess: true,
      })
      // Возвращаем стандартный Response
      return new Response(JSON.stringify(updatedCart), { status: 200, headers })
    } else {
      // Товар не найден, возвращаем текущую корзину без изменений
      // Возвращаем стандартный Response
      return new Response(JSON.stringify(cart), { status: 200, headers })
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(
      `Error removing item (product ${productId}) from cart: ${errorMessage}`,
    )
    // Возвращаем стандартный Response с ошибкой
    return new Response(JSON.stringify({ message: 'Failed to remove item from cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default removeItemHandler
 