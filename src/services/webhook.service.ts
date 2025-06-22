import crypto from 'crypto'
import type { Payload } from 'payload'
import { BaseService } from './base.service'
import type {
  WebhookPayload,
  EventHandlerResult,
  RetryConfig,
} from '@/types/events'

/**
 * Сервис для отправки webhook уведомлений
 * Обеспечивает:
 * - Отправку HTTP запросов во внешние системы
 * - Подписи для верификации подлинности
 * - Retry логику для неудачных запросов
 * - Логирование всех webhook вызовов
 */
export class WebhookService extends BaseService {
  private readonly DEFAULT_TIMEOUT = 30000 // 30 секунд
  private readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
    maxDelay: 30000,
  }

  constructor(payload: Payload) {
    super(payload)
  }

  /**
   * Отправляет webhook с полными метаданными
   */
  async sendWebhook(
    url: string,
    payload: WebhookPayload,
    options: {
      headers?: Record<string, string>
      secret?: string
      timeout?: number
      retryConfig?: RetryConfig
    } = {}
  ): Promise<EventHandlerResult> {
    const {
      headers = {},
      secret,
      timeout = this.DEFAULT_TIMEOUT,
      retryConfig = this.DEFAULT_RETRY_CONFIG,
    } = options

    const startTime = Date.now()
    let lastError: Error | null = null

    // Подготавливаем payload
    const payloadString = JSON.stringify(payload)
    
    // Добавляем подпись если есть секрет
    if (secret) {
      payload.signature = this.generateSignature(payloadString, secret)
    }

    // Подготавливаем заголовки
    const requestHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'FlowMasters-Webhook/1.0',
      'X-FlowMasters-Event': payload.event.type,
      'X-FlowMasters-Event-ID': payload.event.id,
      'X-FlowMasters-Timestamp': payload.timestamp,
      ...headers,
    }

    if (payload.signature) {
      requestHeaders['X-FlowMasters-Signature'] = payload.signature
    }

    // Пытаемся отправить webhook с повторными попытками
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const response = await this.makeRequest(url, {
          method: 'POST',
          headers: requestHeaders,
          body: payloadString,
          timeout,
        })

        const processingTime = Date.now() - startTime

        // Логируем успешную отправку
        await this.logWebhookCall({
          url,
          event: payload.event,
          attempt,
          status: 'success',
          statusCode: response.status,
          responseTime: processingTime,
          response: await this.safeParseResponse(response),
        })

        console.log(
          `Webhook sent successfully to ${url} in ${processingTime}ms (attempt ${attempt})`
        )

        return {
          success: true,
          metadata: {
            statusCode: response.status,
            responseTime: processingTime,
            attempt,
          },
        }

      } catch (error) {
        lastError = error as Error
        const processingTime = Date.now() - startTime

        console.error(
          `Webhook failed to ${url} on attempt ${attempt}:`,
          error
        )

        // Логируем неудачную попытку
        await this.logWebhookCall({
          url,
          event: payload.event,
          attempt,
          status: 'failed',
          error: lastError.message,
          responseTime: processingTime,
        })

        // Если это не последняя попытка, ждем перед повтором
        if (attempt < retryConfig.maxAttempts) {
          const delay = Math.min(
            retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
            retryConfig.maxDelay
          )

          console.log(`Retrying webhook to ${url} in ${delay}ms...`)
          await this.sleep(delay)
        }
      }
    }

    // Все попытки неудачны
    const totalTime = Date.now() - startTime

    return {
      success: false,
      error: lastError || new Error('Unknown webhook error'),
      shouldRetry: false, // Уже исчерпали все попытки
      metadata: {
        totalAttempts: retryConfig.maxAttempts,
        totalTime,
      },
    }
  }

  /**
   * Генерирует HMAC подпись для webhook payload
   */
  generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
  }

  /**
   * Проверяет подпись webhook payload
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret)
    
    // Используем crypto.timingSafeEqual для защиты от timing attacks
    const providedSignature = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')
    
    if (providedSignature.length !== expectedBuffer.length) {
      return false
    }
    
    return crypto.timingSafeEqual(providedSignature, expectedBuffer)
  }

  /**
   * Отправляет тестовый webhook
   */
  async sendTestWebhook(
    url: string,
    options: {
      headers?: Record<string, string>
      secret?: string
    } = {}
  ): Promise<EventHandlerResult> {
    const testPayload: WebhookPayload = {
      event: {
        id: `test_${Date.now()}`,
        type: 'system.test' as any,
        timestamp: new Date().toISOString(),
        source: 'flowmasters',
        version: '1.0',
        data: {
          current: {
            test: true,
            message: 'This is a test webhook from FlowMasters',
            timestamp: new Date().toISOString(),
          },
        },
      },
      subscription: {
        id: 'test',
        name: 'Test Webhook',
      },
      timestamp: new Date().toISOString(),
    }

    return await this.sendWebhook(url, testPayload, options)
  }

  /**
   * Получает статистику webhook вызовов
   */
  async getWebhookStats(filters: {
    url?: string
    eventType?: string
    dateFrom?: string
    dateTo?: string
  } = {}): Promise<any> {
    try {
      const query: any = {}

      if (filters.url) {
        query.url = { contains: filters.url }
      }

      if (filters.eventType) {
        query.eventType = { equals: filters.eventType }
      }

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {}
        if (filters.dateFrom) {
          query.createdAt.greater_than_or_equal = filters.dateFrom
        }
        if (filters.dateTo) {
          query.createdAt.less_than_or_equal = filters.dateTo
        }
      }

      const logs = await this.payload.find({
        collection: 'webhook-logs',
        where: query,
        limit: 1000,
      })

      // Вычисляем статистику
      const totalRequests = logs.docs.length
      const successfulRequests = logs.docs.filter((log: any) => log.status === 'success').length
      const failedRequests = totalRequests - successfulRequests
      const averageResponseTime = logs.docs.reduce((sum: number, log: any) =>
        sum + (log.responseTime || 0), 0) / totalRequests || 0

      return {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
        averageResponseTime: Math.round(averageResponseTime),
        recentLogs: logs.docs.slice(0, 10),
      }

    } catch (error) {
      console.error('Error getting webhook stats:', error)
      throw error
    }
  }

  /**
   * Получает статистику webhook вызовов
   */
  async getWebhookStats(filters?: {
    url?: string
    eventType?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<{
    totalCalls: number
    successRate: number
    averageResponseTime: number
    callsByStatus: Record<string, number>
    callsByUrl: Record<string, number>
  }> {
    try {
      const query: any = {}

      if (filters?.url) {
        query.url = { contains: filters.url }
      }

      if (filters?.eventType) {
        query['event.type'] = { equals: filters.eventType }
      }

      if (filters?.dateFrom || filters?.dateTo) {
        query.createdAt = {}
        if (filters.dateFrom) {
          query.createdAt.greater_than_or_equal = filters.dateFrom
        }
        if (filters.dateTo) {
          query.createdAt.less_than_or_equal = filters.dateTo
        }
      }

      const result = await this.payload.find({
        collection: 'webhook-logs',
        where: query,
        limit: 10000,
      })

      const logs = result.docs as any[]

      const stats = {
        totalCalls: logs.length,
        successRate: 0,
        averageResponseTime: 0,
        callsByStatus: {} as Record<string, number>,
        callsByUrl: {} as Record<string, number>,
      }

      if (logs.length === 0) {
        return stats
      }

      // Подсчитываем статистику
      let totalResponseTime = 0
      let successCount = 0

      logs.forEach(log => {
        // Статус
        const status = log.status || 'unknown'
        stats.callsByStatus[status] = (stats.callsByStatus[status] || 0) + 1

        // URL
        const url = log.url || 'unknown'
        stats.callsByUrl[url] = (stats.callsByUrl[url] || 0) + 1

        // Время ответа
        if (log.responseTime) {
          totalResponseTime += log.responseTime
        }

        // Успешные вызовы
        if (status === 'success') {
          successCount++
        }
      })

      stats.successRate = (successCount / logs.length) * 100
      stats.averageResponseTime = totalResponseTime / logs.length

      return stats

    } catch (error) {
      console.error('Error getting webhook stats:', error)
      throw error
    }
  }

  /**
   * Выполняет HTTP запрос с таймаутом
   */
  private async makeRequest(
    url: string,
    options: {
      method: string
      headers: Record<string, string>
      body: string
      timeout: number
    }
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout)

    try {
      const response = await fetch(url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        )
      }

      return response

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${options.timeout}ms`)
      }
      
      throw error
    }
  }

  /**
   * Безопасно парсит ответ
   */
  private async safeParseResponse(response: Response): Promise<any> {
    try {
      const text = await response.text()
      
      if (!text) {
        return null
      }

      // Пытаемся распарсить как JSON
      try {
        return JSON.parse(text)
      } catch {
        // Если не JSON, возвращаем как текст
        return { text }
      }

    } catch (error) {
      console.warn('Error parsing webhook response:', error)
      return null
    }
  }

  /**
   * Логирует вызов webhook
   */
  private async logWebhookCall(logData: {
    url: string
    event: any
    attempt: number
    status: 'success' | 'failed'
    statusCode?: number
    error?: string
    responseTime: number
    response?: any
  }): Promise<void> {
    try {
      await this.payload.create({
        collection: 'webhook-logs',
        data: {
          ...logData,
          eventId: logData.event.id,
          eventType: logData.event.type,
          createdAt: new Date().toISOString(),
        },
      })

    } catch (error) {
      console.error('Error logging webhook call:', error)
      // Не бросаем ошибку, чтобы не нарушить основной процесс
    }
  }

  /**
   * Задержка выполнения
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
