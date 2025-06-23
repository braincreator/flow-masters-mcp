import type { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/utilities/logger'

/**
 * Middleware для обработки ошибок в системе событий
 */

export interface EventError extends Error {
  eventType?: string
  eventId?: string
  subscriptionId?: string
  channel?: string
  attempt?: number
  context?: Record<string, any>
}

/**
 * Создает стандартизированную ошибку события
 */
export function createEventError(
  message: string,
  options: {
    eventType?: string
    eventId?: string
    subscriptionId?: string
    channel?: string
    attempt?: number
    context?: Record<string, any>
    cause?: Error
  } = {}
): EventError {
  const error = new Error(message) as EventError
  
  error.eventType = options.eventType
  error.eventId = options.eventId
  error.subscriptionId = options.subscriptionId
  error.channel = options.channel
  error.attempt = options.attempt
  error.context = options.context
  
  if (options.cause) {
    error.cause = options.cause
    error.stack = options.cause.stack
  }
  
  return error
}

/**
 * Логирует ошибку события с контекстом
 */
export function logEventError(error: EventError): void {
  const logData = {
    message: error.message,
    eventType: error.eventType,
    eventId: error.eventId,
    subscriptionId: error.subscriptionId,
    channel: error.channel,
    attempt: error.attempt,
    context: error.context,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  }
  
  logger.error('Event processing error:', logData)
}

/**
 * Определяет, нужно ли повторить обработку события
 */
export function shouldRetryEvent(error: EventError): boolean {
  // Не повторяем при ошибках валидации
  if (error.message.includes('validation') || error.message.includes('invalid')) {
    return false
  }
  
  // Не повторяем при ошибках аутентификации
  if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
    return false
  }
  
  // Не повторяем при ошибках 4xx (кроме 429)
  if (error.message.includes('400') || error.message.includes('404')) {
    return false
  }
  
  // Повторяем при сетевых ошибках и 5xx
  if (
    error.message.includes('network') ||
    error.message.includes('timeout') ||
    error.message.includes('500') ||
    error.message.includes('502') ||
    error.message.includes('503') ||
    error.message.includes('504')
  ) {
    return true
  }
  
  // По умолчанию повторяем
  return true
}

/**
 * Вычисляет задержку для повторной попытки
 */
export function calculateRetryDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000,
  multiplier: number = 2
): number {
  const delay = baseDelay * Math.pow(multiplier, attempt - 1)
  return Math.min(delay, maxDelay)
}

/**
 * Обработчик ошибок для API событий
 */
export function handleEventApiError(error: any, context: {
  eventType?: string
  eventId?: string
  subscriptionId?: string
}): NextResponse {
  const eventError = createEventError(
    error.message || 'Unknown error',
    {
      ...context,
      cause: error,
    }
  )
  
  logEventError(eventError)
  
  // Определяем статус код
  let statusCode = 500
  if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    statusCode = 400
  } else if (error.message?.includes('unauthorized')) {
    statusCode = 401
  } else if (error.message?.includes('forbidden')) {
    statusCode = 403
  } else if (error.message?.includes('not found')) {
    statusCode = 404
  }
  
  return NextResponse.json(
    {
      error: 'Event processing failed',
      message: error.message,
      eventType: context.eventType,
      eventId: context.eventId,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

/**
 * Wrapper для безопасного выполнения операций с событиями
 */
export async function safeEventOperation<T>(
  operation: () => Promise<T>,
  context: {
    eventType?: string
    eventId?: string
    subscriptionId?: string
    channel?: string
  }
): Promise<{ success: boolean; data?: T; error?: EventError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    const eventError = createEventError(
      error instanceof Error ? error.message : 'Unknown error',
      {
        ...context,
        cause: error instanceof Error ? error : undefined,
      }
    )
    
    logEventError(eventError)
    
    return { success: false, error: eventError }
  }
}

/**
 * Создает circuit breaker для предотвращения каскадных ошибок
 */
export class EventCircuitBreaker {
  private failures: number = 0
  private lastFailureTime: number = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  constructor(
    private maxFailures: number = 5,
    private resetTimeoutMs: number = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failures = 0
    this.state = 'closed'
  }
  
  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.maxFailures) {
      this.state = 'open'
    }
  }
  
  getState(): string {
    return this.state
  }
  
  getFailures(): number {
    return this.failures
  }
}

/**
 * Глобальный circuit breaker для webhook вызовов
 */
export const webhookCircuitBreaker = new EventCircuitBreaker(5, 60000)

/**
 * Глобальный circuit breaker для email уведомлений
 */
export const emailCircuitBreaker = new EventCircuitBreaker(3, 30000)

/**
 * Глобальный circuit breaker для Telegram уведомлений
 */
export const telegramCircuitBreaker = new EventCircuitBreaker(3, 30000)

/**
 * Получает circuit breaker для канала
 */
export function getCircuitBreakerForChannel(channel: string): EventCircuitBreaker | null {
  switch (channel) {
    case 'webhook':
      return webhookCircuitBreaker
    case 'email':
      return emailCircuitBreaker
    case 'telegram':
      return telegramCircuitBreaker
    default:
      return null
  }
}

/**
 * Middleware для мониторинга производительности событий
 */
export class EventPerformanceMonitor {
  private metrics: Map<string, {
    count: number
    totalTime: number
    errors: number
    lastExecution: number
  }> = new Map()
  
  async measure<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await operation()
      this.recordSuccess(operationName, Date.now() - startTime)
      return result
    } catch (error) {
      this.recordError(operationName, Date.now() - startTime)
      throw error
    }
  }
  
  private recordSuccess(operationName: string, duration: number): void {
    const metric = this.metrics.get(operationName) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      lastExecution: 0,
    }
    
    metric.count++
    metric.totalTime += duration
    metric.lastExecution = Date.now()
    
    this.metrics.set(operationName, metric)
  }
  
  private recordError(operationName: string, duration: number): void {
    const metric = this.metrics.get(operationName) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      lastExecution: 0,
    }
    
    metric.count++
    metric.totalTime += duration
    metric.errors++
    metric.lastExecution = Date.now()
    
    this.metrics.set(operationName, metric)
  }
  
  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {}
    
    for (const [name, metric] of this.metrics) {
      result[name] = {
        count: metric.count,
        averageTime: metric.count > 0 ? metric.totalTime / metric.count : 0,
        errorRate: metric.count > 0 ? (metric.errors / metric.count) * 100 : 0,
        lastExecution: new Date(metric.lastExecution).toISOString(),
      }
    }
    
    return result
  }
}

/**
 * Глобальный монитор производительности
 */
export const eventPerformanceMonitor = new EventPerformanceMonitor()
