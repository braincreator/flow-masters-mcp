import type { Endpoint } from 'payload'
import type { PayloadRequest } from 'payload/dist/types'
import type { User, UserFavorite } from '@/payload-types'

const toggleFavoriteHandler: Endpoint['handler'] = async (
  req: PayloadRequest,
): Promise<Response> => {
  const headers = { 'Content-Type': 'application/json' }

  if (!req.user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers })
  }

  const userId = (req.user as User).id
  let productId: string | undefined

  try {
    // Явно читаем и парсим тело запроса
    const body = await req.json?.() // Используем req.json() с проверкой на undefined
    req.payload.logger.info(`[FavoriteToggle] Parsed req.body: ${JSON.stringify(body)}`)
    productId = body?.productId // Получаем productId из распарсенного тела
  } catch (parseError: unknown) {
    req.payload.logger.error(
      `[FavoriteToggle] Failed to parse request body: ${
        parseError instanceof Error ? parseError.message : String(parseError)
      }`,
    )
    return new Response(JSON.stringify({ message: 'Invalid request body' }), {
      status: 400,
      headers,
    })
  }

  // Логгируем тело запроса на сервере (старый лог можно убрать)
  // req.payload.logger.info(`[FavoriteToggle] Received req.body: ${JSON.stringify(req.body)}`)

  if (!productId || typeof productId !== 'string') {
    req.payload.logger.warn(
      `[FavoriteToggle] Invalid productId received: ${productId} (Type: ${typeof productId})`,
    )
    return new Response(JSON.stringify({ message: 'Product ID is required' }), {
      status: 400,
      headers,
    })
  }

  try {
    // Получаем пользователя из Payload по ID - ЭТОТ ШАГ МОЖНО УБРАТЬ, т.к. req.user уже есть
    // const userResult = await req.payload.findByID({
    //   collection: 'users',
    //   id: userId,
    //   depth: 0,
    // })
    // req.payload.logger.info(`[FavoriteToggle] User found by findByID: ${userResult ? 'Yes' : 'No'}`)

    // 1. Найти существующую запись избранного для пользователя
    let favoriteDoc: UserFavorite | null = null
    const findResult = await req.payload.find({
      collection: 'user-favorites',
      where: { user: { equals: userId } },
      limit: 1,
      depth: 0, // Только ID
      user: req.user, // Передаем ПОЛНЫЙ ОБЪЕКТ req.user для авторизации
    })

    if (findResult.docs.length > 0) {
      favoriteDoc = findResult.docs[0] as UserFavorite
    }

    let currentFavorites: string[] = []
    if (favoriteDoc && Array.isArray(favoriteDoc.products)) {
      currentFavorites = favoriteDoc.products.map((p) => (typeof p === 'string' ? p : p.id))
    }

    // Используем productId, полученный из await req.json()
    const isCurrentlyFavorite = currentFavorites.includes(productId)
    let updatedFavorites: string[]
    let newIsFavoriteState: boolean

    if (isCurrentlyFavorite) {
      updatedFavorites = currentFavorites.filter((id) => id !== productId)
      newIsFavoriteState = false
    } else {
      updatedFavorites = [...currentFavorites, productId]
      newIsFavoriteState = true
    }

    // 2. Обновить или создать запись
    if (favoriteDoc) {
      // Для отладки выведем данные
      req.payload.logger.info(`[FavoriteToggle] Updating document with user: ${userId}`)

      await req.payload.update({
        collection: 'user-favorites',
        id: favoriteDoc.id,
        data: {
          products: updatedFavorites,
        },
        user: req.user, // Передаем полный объект пользователя для авторизации
      })
    } else {
      // Для отладки выведем данные
      req.payload.logger.info(
        `[FavoriteToggle] Creating document with simple userId for user: ${userId}`,
      )

      // Пробуем передать userId напрямую в data
      await req.payload.create({
        collection: 'user-favorites',
        data: {
          products: updatedFavorites,
          user: userId, // Передаем userId напрямую
        },
        user: req.user, // Передаем полный объект пользователя для авторизации
      })
    }
    return new Response(JSON.stringify({ isFavorite: newIsFavoriteState }), {
      status: 200,
      headers,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(
      `Error toggling favorite for user ${userId}, product ${productId}: ${errorMessage}`,
    )
    return new Response(JSON.stringify({ message: 'Failed to toggle favorite' }), {
      status: 500,
      headers,
    })
  }
}

export default toggleFavoriteHandler
