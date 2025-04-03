import type { Endpoint } from 'payload/config'
import type { PayloadRequest } from 'payload/types'
import type { User, UserFavorite } from '@/payload-types'

// Убираем res, функция возвращает Promise<Response>
const getFavoritesHandler: Endpoint['handler'] = async (req: PayloadRequest): Promise<Response> => {
  // Заголовки для ответа
  const headers = { 'Content-Type': 'application/json' }

  if (!req.user) {
    // Возвращаем пустой массив для неавторизованных, используя стандартный Response
    return new Response(JSON.stringify([]), { status: 200, headers })
    // Или можно вернуть 401:
    // return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
  }

  const userId = (req.user as User).id

  try {
    const result = await req.payload.find({
      collection: 'user-favorites',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 1,
      depth: 0, // Нам нужны только ID продуктов
      user: req.user, // Передаем пользователя для проверки прав доступа
    })

    let productIds: string[] = []
    if (result.docs.length > 0) {
      const favorites = result.docs[0]
      if (Array.isArray(favorites.products)) {
        productIds = favorites.products.map((p) => (typeof p === 'string' ? p : p.id))
      }
    }
    // Возвращаем результат через стандартный Response
    return new Response(JSON.stringify(productIds), { status: 200, headers })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(`Error fetching favorites for user ${userId}: ${errorMessage}`)
    // Возвращаем ошибку через стандартный Response
    return new Response(JSON.stringify({ message: 'Failed to fetch favorites' }), {
      status: 500,
      headers,
    })
  }
}

export default getFavoritesHandler
