import { NextResponse } from 'next/server'
import { CartSession, Product, User, UserFavorite } from '@/payload-types'

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

/**
 * Fetches current exchange rates from an external API
 * @returns A record of exchange rates in the format {USD_EUR: 0.85, USD_GBP: 0.75, ...}
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()

    if (!data.rates) {
      throw new Error('Invalid response from exchange rate API')
    }

    // Convert response to the required format (USD_EUR, USD_GBP, etc.)
    const formattedRates: Record<string, number> = {}

    Object.entries(data.rates).forEach(([currency, rate]) => {
      formattedRates[`USD_${currency}`] = rate as number
    })

    return formattedRates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return {} // Return empty object on error, service will use manual rates
  }
}

// --- API Base URL ---
const API_BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || ''

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

  const response = await fetch(url, {
    ...options,
    headers,
    // Важно для SWR: передавать cookie для аутентификации
    credentials: 'include',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) // Попытаться получить тело ошибки
    console.error(`API Error (${response.status}): ${url}`, errorData)
    throw new Error(
      `API request failed with status ${response.status}: ${errorData?.errors?.[0]?.message || response.statusText}`,
    )
  }

  // Для методов DELETE или других, где нет тела ответа
  if (response.status === 204) {
    return null as T // Или другое подходящее значение
  }

  try {
    return (await response.json()) as T
  } catch (e) {
    console.error('Failed to parse API response JSON', e)
    throw new Error('Invalid JSON response from API')
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

// Получить корзину пользователя (или анонимную)
// Payload не имеет простого способа получить корзину "текущего" пользователя напрямую
// Нужно либо передавать user ID, либо session ID, либо реализовать кастомный эндпоинт
// Пока что сделаем кастомный эндпоинт (предполагаем, что он будет создан)
export const getCart = (): Promise<CartSession | null> => {
  // Предполагаем кастомный эндпоинт '/api/cart'
  return fetchPayloadAPI<CartSession>('/cart', { method: 'GET' })
}

// Добавить товар в корзину
export const addToCart = (productId: string, quantity: number = 1): Promise<CartSession> => {
  return fetchPayloadAPI<CartSession>('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  })
}

// Обновить количество товара
export const updateCartItemQuantity = (
  productId: string,
  quantity: number,
): Promise<CartSession> => {
  return fetchPayloadAPI<CartSession>('/cart/update', {
    method: 'PATCH', // Или PUT
    body: JSON.stringify({ productId, quantity }),
  })
}

// Удалить товар из корзины
export const removeFromCart = (productId: string): Promise<CartSession> => {
  return fetchPayloadAPI<CartSession>(`/cart/remove/${productId}`, {
    // Используем ID в URL
    method: 'DELETE',
  })
}

// Очистить корзину
export const clearCart = (): Promise<void> => {
  return fetchPayloadAPI<void>('/cart', {
    method: 'DELETE',
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
        console.error('Failed to fetch favorites:', error)
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
