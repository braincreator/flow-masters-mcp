import type { PayloadRequest } from 'payload/types'
import type { CartSession, User, Product } from '@/payload-types'
import crypto from 'crypto'
// Убираем Response из express, импортируем serialize из cookie
// import { Response } from 'express'
import { serialize } from 'cookie'

const SESSION_COOKIE_NAME = 'payload-cart-session'
const SESSION_MAX_AGE_DAYS = 30

// Тип результата для getOrSetSessionId
type SessionResult = {
  sessionId: string
  newCookieHeader?: string // Заголовок для установки cookie
}

/**
 * Получает session ID из cookie.
 * Если cookie нет, генерирует новый ID и строку заголовка Set-Cookie.
 */
export function getOrSetSessionId(req: PayloadRequest): SessionResult {
  let sessionId = req.cookies?.[SESSION_COOKIE_NAME]
  let newCookieHeader: string | undefined = undefined

  if (!sessionId) {
    sessionId = crypto.randomBytes(16).toString('hex')
    // Генерируем строку заголовка Set-Cookie
    newCookieHeader = serialize(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60, // maxAge в секундах
      path: '/',
    })
    // Добавляем в req.cookies для немедленного использования
    if (!req.cookies) req.cookies = {}
    req.cookies[SESSION_COOKIE_NAME] = sessionId
  }
  return { sessionId, newCookieHeader }
}

// Тип результата для findCartSession
type FindCartResult = {
  cartSession: CartSession | null
  newCookieHeader?: string
}

/**
 * Находит корзину для текущего пользователя (авторизованного или анонимного).
 * @param req - PayloadRequest
 * @param createIfNotExists - Создавать ли новую сессию, если не найдена (default: false)
 * @returns Объект { cartSession: CartSession | null, newCookieHeader?: string }
 */
export async function findCartSession(
  req: PayloadRequest,
  // Убираем res из аргументов
  // res: Response,
  createIfNotExists: boolean = false,
): Promise<FindCartResult> {
  // Меняем тип возвращаемого значения
  const user = req.user as User | undefined
  const payload = req.payload

  let cartSession: CartSession | null = null
  let sessionResult: SessionResult | undefined = undefined // Для хранения cookie info

  if (user) {
    // 1. Попытка найти корзину по user ID (логика без изменений)
    const result = await payload.find({
      collection: 'cart-sessions',
      where: { user: { equals: user.id }, convertedToOrder: { not_equals: true } },
      limit: 1,
      sort: '-updatedAt',
      depth: 1,
      user: req.user,
      overrideAccess: true,
    })
    if (result.docs.length > 0) {
      cartSession = result.docs[0]
    }
  } else {
    // 2. Анонимный пользователь: Попытка найти по session ID из cookie
    // Вызываем обновленный getOrSetSessionId
    sessionResult = getOrSetSessionId(req)
    const sessionId = sessionResult.sessionId

    const result = await payload.find({
      collection: 'cart-sessions',
      where: { sessionId: { equals: sessionId }, convertedToOrder: { not_equals: true } },
      limit: 1,
      sort: '-updatedAt',
      depth: 1,
    })
    if (result.docs.length > 0) {
      cartSession = result.docs[0]
    }
  }

  // 3. Создать новую сессию, если не найдена и флаг установлен
  if (!cartSession && createIfNotExists) {
    // Убедимся, что sessionResult существует, если создаем для анонима
    if (!sessionResult && !user) {
      sessionResult = getOrSetSessionId(req)
    }
    // Используем ID из sessionResult или генерируем новый, если user есть, а sessionResult нет (маловероятно)
    const sessionIdToCreate =
      sessionResult?.sessionId ?? (!user ? crypto.randomBytes(16).toString('hex') : undefined)
    if (!sessionIdToCreate && !user) {
      payload.logger.error('Failed to determine sessionId for anonymous cart creation')
      return { cartSession: null, newCookieHeader: sessionResult?.newCookieHeader }
    }

    try {
      cartSession = await payload.create({
        collection: 'cart-sessions',
        data: {
          sessionId: sessionIdToCreate,
          items: [],
          ...(user && { user: user.id }),
        },
        depth: 1,
        user: req.user,
        overrideAccess: true,
      })
    } catch (error) {
      payload.logger.error(`Error creating cart session: ${error}`)
      // Возвращаем null и cookie header, если он был
      return { cartSession: null, newCookieHeader: sessionResult?.newCookieHeader }
    }
  }

  // 4. Опционально: Обновить цены в найденной корзине перед возвратом
  if (cartSession) {
    // updateCartPrices не требует res, поэтому вызов остается прежним
    cartSession = await updateCartPrices(req, cartSession)
  }

  // Возвращаем результат с корзиной и возможным заголовком cookie
  return { cartSession, newCookieHeader: sessionResult?.newCookieHeader }
}

/**
 * Обновляет цены товаров в корзине на основе текущих цен продуктов.
 */
export async function updateCartPrices(
  req: PayloadRequest,
  cart: CartSession,
): Promise<CartSession> {
  if (!cart.items || cart.items.length === 0) {
    return cart // Нечего обновлять
  }

  const payload = req.payload
  let needsUpdate = false
  const updatedItems = await Promise.all(
    cart.items.map(async (item) => {
      if (!item.product || typeof item.product !== 'object') {
        // Продукт не загружен (depth=0?), пропускаем
        return item
      }
      const currentProduct = item.product as Product
      const currentPrice = currentProduct.pricing?.finalPrice

      // Если цена изменилась или не была записана
      if (currentPrice !== undefined && item.price !== currentPrice) {
        needsUpdate = true
        return { ...item, price: currentPrice } // Обновляем цену в item
      }
      return item
    }),
  )

  // Если цены изменились, обновляем документ CartSession
  if (needsUpdate) {
    try {
      const updatedCart = await payload.update({
        collection: 'cart-sessions',
        id: cart.id,
        data: {
          items: updatedItems,
          // Обновляем также currency, если нужно
        },
        depth: 1, // Возвращаем обновленную корзину с продуктами
        user: req.user,
        overrideAccess: true, // Разрешаем обновление
      })
      return updatedCart
    } catch (error) {
      payload.logger.error(`Error updating cart prices for session ${cart.id}: ${error}`)
      return cart // Возвращаем старую корзину в случае ошибки обновления
    }
  }

  return { ...cart, items: updatedItems } // Возвращаем корзину с обновленными (или нет) item объектами
}
