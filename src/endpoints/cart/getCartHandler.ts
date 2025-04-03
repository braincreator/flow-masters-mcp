import type { Endpoint } from 'payload/config'
import type { PayloadRequest } from 'payload/types'
// Убираем Response из express
// import { Response } from 'express'
import { findCartSession } from './cartHelpers'

// GET /api/cart
// Убираем res из аргументов, функция должна вернуть Response
const getCartHandler: Endpoint['handler'] = async (req: PayloadRequest): Promise<Response> => {
  try {
    // Находим корзину (не создаем, если ее нет)
    // findCartSession теперь возвращает { cartSession, newCookieHeader }
    const { cartSession, newCookieHeader } = await findCartSession(req, false)

    // Готовим заголовки
    const headers = new Headers({
      'Content-Type': 'application/json',
    })
    if (newCookieHeader) {
      headers.set('Set-Cookie', newCookieHeader)
    }

    // Создаем и возвращаем стандартный Response
    return new Response(JSON.stringify(cartSession), {
      status: 200,
      headers: headers,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(`Error fetching cart: ${errorMessage}`)

    // Возвращаем стандартный Response с ошибкой
    return new Response(JSON.stringify({ message: 'Failed to fetch cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default getCartHandler
