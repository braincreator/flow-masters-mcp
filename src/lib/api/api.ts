/**
 * Базовый URL для API запросов
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/**
 * Выполняет запрос к API
 * @param endpoint Эндпоинт API
 * @param options Опции запроса
 * @returns Результат запроса
 */
export async function fetchFromAPI<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
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
      // Важно для аутентификации: передавать cookie
      credentials: 'include',
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { message: response.statusText }
      }

      console.error(`API Error (${response.status}): ${url}`, errorData)

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
      return null as T
    }

    const data = await response.json()
    console.log(`API Response: ${url}`, { status: response.status })
    return data as T
  } catch (e) {
    // Обрабатываем ошибки сети или парсинга JSON
    if (e instanceof Error) {
      // Если это уже ошибка API, пробрасываем ее дальше
      if (e.message.startsWith('API Error')) {
        console.error(`API Error Details:`, e.message)
        throw e
      }

      // Сетевые ошибки и т.п.
      console.error('API request failed:', e.message)
      throw new Error(`Failed to fetch data: ${e.message}`)
    }

    // Неизвестная ошибка
    console.error('Unknown API error', e)
    throw new Error('Unknown error occurred during API request')
  }
}
