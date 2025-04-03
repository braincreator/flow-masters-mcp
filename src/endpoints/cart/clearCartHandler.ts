import type { Endpoint } from 'payload/config'
import type { PayloadRequest } from 'payload/types'
// Убираем Response из express
// import { Response } from 'express'
import { findCartSession } from './cartHelpers'

// DELETE /api/cart
// Убираем res, возвращаем Promise<Response>
const clearCartHandler: Endpoint['handler'] = async (req: PayloadRequest): Promise<Response> => {
  // Используем пустые заголовки для 204
  const headers = {}

  try {
    const payload = req.payload

    // 1. Найти существующую корзину
    const { cartSession: cart, newCookieHeader } = await findCartSession(req, false)

    // Устанавливаем cookie, если он есть
    if (newCookieHeader) {
      headers['Set-Cookie'] = newCookieHeader
    }

    if (!cart) {
      // Корзины нет, значит уже очищена
      // Возвращаем стандартный Response 204
      return new Response(null, { status: 204, headers })
    }

    // 2. Обновить CartSession, установив пустой массив items
    await payload.update({
      collection: 'cart-sessions',
      id: cart.id,
      data: {
        items: [],
      },
      depth: 0, // Не нужно возвращать данные
      user: req.user,
      overrideAccess: true,
    })

    // Возвращаем стандартный Response 204
    return new Response(null, { status: 204, headers })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(`Error clearing cart: ${errorMessage}`)
    // Возвращаем стандартный Response 500
    return new Response(JSON.stringify({ message: 'Failed to clear cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default clearCartHandler
 