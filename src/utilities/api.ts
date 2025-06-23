import { NextResponse } from 'next/server'
import { CartSession, Product, User, UserFavorite } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Helper function to create a standardized error response
 * @param message Error message
 * @param status HTTP status code
 * @returns NextResponse with error message and status
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  )
}

/**
 * Helper function to create a standardized success response
 * @param data Response data
 * @param status HTTP status code
 * @returns NextResponse with success message and data
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status },
  )
}

// --- API Base URL ---
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Helper for making authenticated requests
export async function fetchPayloadAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    // Добавить заголовок авторизации, если необходимо
    // 'Authorization': `Bearer ${token}`,
    ...(options.headers || {}),
  }

  // Убедимся, что в URL всегда есть /api
  const apiPath = endpoint.startsWith('/api')
    ? endpoint
    : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  const url = `${API_BASE_URL}${apiPath}`

  try {
    console.log(`API Request: ${options.method || 'GET'} ${url}`)
    const response = await fetch(url, {
      ...options,
      headers,
      // Важно для SWR: передавать cookie для аутентификации
      credentials: 'include',
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { message: response.statusText }
      }

      logError(`API Error (${response.status}): ${url}`, errorData)

      // Улучшенное сообщение об ошибке
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        errorData?.errors?.[0]?.message ||
        response.statusText ||
        `Request failed with status ${response.status}`

      throw new Error(`API Error (${response.status}): ${errorMessage}`)
    }

    // Для методов DELETE или других, где нет тела ответа
    if (response.status === 204) {
      return null as T // Или другое подходящее значение
    }

    const data = await response.json()
    logDebug(`API Response: ${url}`, { status: response.status })
    return data as T
  } catch (e) {
    // Обрабатываем ошибки сети или парсинга JSON
    if (e instanceof Error) {
      // Если это уже ошибка API, пробрасываем ее дальше
      if (e.message.startsWith('API Error')) {
        logError(`API Error Details:`, e.message)
        throw e
      }

      // Сетевые ошибки и т.п.
      logError('API request failed:', e.message)
      throw new Error(`Failed to fetch data: ${e.message}`)
    }

    // Неизвестная ошибка
    logError('Unknown API error', e)
    throw new Error('Unknown error occurred during API request')
  }
}

// --- Cart API Functions ---

// Тип для ответа Payload при запросе списка
type PayloadCollectionResponse<T> = {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

/**
 * Получить корзину пользователя (или анонимную)
 */
export const getCart = (): Promise<CartSession | null> => {
  logDebug('API: Fetching cart data')
  // Используем правильный путь к API
  return fetchPayloadAPI<CartSession>('/v1/cart', { method: 'GET' })
    .then((response) => {
      logDebug('API: Cart data received:', response)
      return response
    })
    .catch((err) => {
      logError('API: Error fetching cart:', err)
      // Возвращаем null вместо выбрасывания исключения для запросов к корзине
      return null
    })
}

/**
 * Добавить товар или услугу в корзину
 */
export const addToCart = (
  itemId: string,
  itemType: 'product' | 'service' = 'product',
  quantity: number = 1,
): Promise<CartSession> => {
  logDebug('API: Sending request to add to cart:', { itemId, itemType, quantity })
  return fetchPayloadAPI<CartSession>('/v1/cart/add', {
    method: 'POST',
    body: JSON.stringify({ itemId, itemType, quantity }),
  })
    .then((response) => {
      logDebug('API: Cart updated successfully:', response)
      return response
    })
    .catch((error) => {
      logError('API: Error updating cart with API:', error)
      throw error
    })
}

/**
 * Обновить количество товара или услуги в корзине
 */
export const updateCartItemQuantity = (
  itemId: string,
  itemType: 'product' | 'service' = 'product',
  quantity: number,
): Promise<CartSession> => {
  logDebug('API: Updating cart item quantity:', { itemId, itemType, quantity })
  return fetchPayloadAPI<CartSession>('/v1/cart/update', {
    method: 'PATCH',
    body: JSON.stringify({ itemId, itemType, quantity }),
  })
    .then((response) => {
      logDebug('API: Cart item quantity updated successfully')
      return response
    })
    .catch((error) => {
      logError('API: Error updating cart item quantity:', error)
      throw error
    })
}

/**
 * Удалить товар или услугу из корзины
 */
export const removeFromCart = (
  itemId: string,
  itemType: 'product' | 'service' = 'product',
): Promise<CartSession> => {
  logDebug('API: Removing item from cart:', { itemId, itemType })
  return fetchPayloadAPI<CartSession>('/v1/cart/remove', {
    method: 'DELETE',
    body: JSON.stringify({ itemId, itemType }),
  })
    .then((response) => {
      logDebug('API: Cart item removed successfully')
      return response
    })
    .catch((error) => {
      logError('API: Error removing cart item:', error)
      throw error
    })
}

/**
 * Очистить корзину
 */
export const clearCart = (): Promise<void> => {
  logDebug('API: Clearing cart')
  return fetchPayloadAPI<void>('/v1/cart', {
    method: 'DELETE',
  })
    .then(() => {
      logDebug('API: Cart cleared successfully')
    })
    .catch((error) => {
      logError('API: Error clearing cart:', error)
      throw error
    })
}

// --- Favorites API Functions ---

// Получить избранное пользователя (вызов кастомного эндпоинта)
export const getFavorites = (): Promise<string[]> => {
  // Просто вызываем наш кастомный эндпоинт /api/favorites
  return (
    fetchPayloadAPI<string[]>('/favorites', { method: 'GET' })
      // Обрабатываем возможный null или не-массив
      .then((data) => (Array.isArray(data) ? data : []))
      .catch((error) => {
        // Если не авторизован (401) или другая ошибка, возвращаем пустой массив
        // чтобы приложение не падало
        logError('Failed to fetch favorites:', error)
        return []
      })
  )
}

// Добавить/удалить из избранного (Toggle)
// Нужен кастомный эндпоинт для простоты
export const toggleFavorite = (productId: string): Promise<{ isFavorite: boolean }> => {
  return fetchPayloadAPI<{ isFavorite: boolean }>('/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  })
}
