/**
 * Улучшенный HTTP клиент с retry логикой и обработкой ошибок
 * Заменяет простые fetch вызовы на более надежные
 */

import { logDebug, logWarn, logError } from '@/utils/logger'
import { simpleMemoryManager } from '@/utilities/simpleMemoryManager'

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  retryDelay?: number
  retryCondition?: (error: any, attempt: number) => boolean
}

interface RequestOptions extends RequestConfig {
  signal?: AbortSignal
}

class HttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number
  private defaultRetries: number

  constructor(config: {
    baseURL?: string
    defaultHeaders?: Record<string, string>
    defaultTimeout?: number
    defaultRetries?: number
  } = {}) {
    this.baseURL = config.baseURL || ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders
    }
    this.defaultTimeout = config.defaultTimeout || 30000
    this.defaultRetries = config.defaultRetries || 3
  }

  /**
   * Выполняет HTTP запрос с retry логикой
   */
  async request<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = 1000,
      retryCondition = this.defaultRetryCondition
    } = config

    const fullUrl = this.buildUrl(url)
    const requestHeaders = { ...this.defaultHeaders, ...headers }

    // Создаем AbortController для таймаута
    const controller = new AbortController()
    const cleanup = simpleMemoryManager.registerAbortController(controller)

    try {
      return await this.executeWithRetry({
        url: fullUrl,
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        timeout,
        retries,
        retryDelay,
        retryCondition
      })
    } finally {
      cleanup()
    }
  }

  /**
   * GET запрос
   */
  async get<T = any>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  /**
   * POST запрос
   */
  async post<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'POST', body: data })
  }

  /**
   * PUT запрос
   */
  async put<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PUT', body: data })
  }

  /**
   * DELETE запрос
   */
  async delete<T = any>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  /**
   * PATCH запрос
   */
  async patch<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PATCH', body: data })
  }

  /**
   * Выполняет запрос с retry логикой
   */
  private async executeWithRetry(options: RequestOptions & {
    url: string
    retries: number
    retryDelay: number
    retryCondition: (error: any, attempt: number) => boolean
  }): Promise<any> {
    const { url, retries, retryDelay, retryCondition, timeout, ...fetchOptions } = options

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        // Устанавливаем таймаут
        const timeoutId = setTimeout(() => {
          if (!options.signal?.aborted) {
            options.signal?.abort?.()
          }
        }, timeout)

        const response = await fetch(url, fetchOptions)
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new HttpError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            await this.safeGetResponseText(response)
          )
        }

        // Пытаемся парсить JSON, если не получается - возвращаем текст
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return await response.json()
        } else {
          return await response.text()
        }

      } catch (error) {
        const isLastAttempt = attempt === retries + 1

        if (isLastAttempt || !retryCondition(error, attempt)) {
          logError(`Request failed after ${attempt} attempts:`, { url, error })
          throw error
        }

        logWarn(`Request attempt ${attempt} failed, retrying in ${retryDelay}ms:`, { url, error })
        await this.delay(retryDelay * attempt) // Exponential backoff
      }
    }
  }

  /**
   * Дефолтное условие для retry
   */
  private defaultRetryCondition(error: any, attempt: number): boolean {
    // Не повторяем для клиентских ошибок (4xx)
    if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
      return false
    }

    // Повторяем для сетевых ошибок и серверных ошибок (5xx)
    return true
  }

  /**
   * Строит полный URL
   */
  private buildUrl(url: string): string {
    if (url.startsWith('http')) {
      return url
    }
    return `${this.baseURL}${url.startsWith('/') ? url : `/${url}`}`
  }

  /**
   * Безопасно получает текст ответа
   */
  private async safeGetResponseText(response: Response): Promise<string> {
    try {
      return await response.text()
    } catch {
      return 'Unable to read response body'
    }
  }

  /**
   * Задержка
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Кастомная ошибка HTTP
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public responseBody?: string
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

// Создаем экземпляры для разных сервисов
export const apiClient = new HttpClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  defaultTimeout: 30000,
  defaultRetries: 3
})

export const externalApiClient = new HttpClient({
  defaultTimeout: 15000,
  defaultRetries: 2
})

export default HttpClient
