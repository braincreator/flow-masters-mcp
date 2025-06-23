import type { Payload } from 'payload'
import { BaseService } from './base.service'
import type {
  Event,
  EventHandler,
  EventHandlerConfig,
  EventHandlerContext,
  EventHandlerResult,
  EventStats,
  EventFilter,
  IntegrationEventType,
  EventPriority,
} from '@/types/events'

/**
 * Централизованная шина событий для FlowMasters
 * Обеспечивает публикацию и подписку на события с поддержкой:
 * - Синхронных и асинхронных обработчиков
 * - Приоритетов обработки
 * - Фильтрации событий
 * - Статистики и логирования
 */
export class EventBusService extends BaseService {
  private static instance: EventBusService | null = null
  private handlers: Map<IntegrationEventType, EventHandlerConfig[]> = new Map()
  private stats: EventStats = {
    totalEvents: 0,
    eventsByType: {},
    eventsByChannel: {},
    successRate: 0,
    failureRate: 0,
    averageProcessingTime: 0,
    lastProcessed: new Date().toISOString(),
  }
  private eventHistory: Event[] = []
  private readonly MAX_HISTORY_SIZE = 1000

  constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService(payload)
    }
    return EventBusService.instance
  }

  /**
   * Публикует событие и уведомляет всех подписчиков
   */
  async publish<T>(event: Event<T>): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Добавляем событие в историю
      this.addToHistory(event)
      
      // Обновляем статистику
      this.updateStats(event.type)
      
      // Получаем обработчики для данного типа события
      const handlers = this.getHandlersForEvent(event.type)
      
      if (handlers.length === 0) {
        console.log(`No handlers registered for event type: ${event.type}`)
        return
      }

      // Сортируем обработчики по приоритету
      const sortedHandlers = this.sortHandlersByPriority(handlers)
      
      // Обрабатываем событие
      await this.processHandlers(event, sortedHandlers)
      
      // Обновляем время обработки
      const processingTime = Date.now() - startTime
      this.updateProcessingTime(processingTime)
      
      console.log(`Event ${event.type} processed successfully in ${processingTime}ms`)
      
    } catch (error) {
      console.error(`Error publishing event ${event.type}:`, error)
      this.updateFailureStats()
      throw error
    }
  }

  /**
   * Подписывается на события
   */
  subscribe(config: EventHandlerConfig): void {
    for (const eventType of config.eventTypes) {
      if (!this.handlers.has(eventType)) {
        this.handlers.set(eventType, [])
      }
      
      const handlers = this.handlers.get(eventType)!
      handlers.push(config)
      
      console.log(`Handler subscribed to event type: ${eventType}`)
    }
  }

  /**
   * Отписывается от событий
   */
  unsubscribe(eventTypes: IntegrationEventType[], handler: EventHandler): void {
    for (const eventType of eventTypes) {
      const handlers = this.handlers.get(eventType)
      if (handlers) {
        const index = handlers.findIndex(h => h.handler === handler)
        if (index !== -1) {
          handlers.splice(index, 1)
          console.log(`Handler unsubscribed from event type: ${eventType}`)
        }
      }
    }
  }

  /**
   * Возвращает статистику событий
   */
  getStats(): EventStats {
    return { ...this.stats }
  }

  /**
   * Возвращает историю событий с фильтрацией
   */
  async getEventHistory(filters?: EventFilter[]): Promise<Event[]> {
    let filteredHistory = [...this.eventHistory]
    
    if (filters && filters.length > 0) {
      filteredHistory = filteredHistory.filter(event => 
        this.applyFilters(event, filters)
      )
    }
    
    return filteredHistory.reverse() // Новые события сначала
  }

  /**
   * Создает событие с автоматической генерацией ID и timestamp
   */
  createEvent<T>(
    type: IntegrationEventType,
    data: T,
    metadata?: Record<string, any>
  ): Event<T> {
    return {
      id: this.generateEventId(),
      type,
      timestamp: new Date().toISOString(),
      source: 'flowmasters',
      version: '1.0',
      metadata,
      data: {
        current: data,
        context: metadata,
      },
    }
  }

  /**
   * Получает обработчики для конкретного типа события
   */
  private getHandlersForEvent(eventType: IntegrationEventType): EventHandlerConfig[] {
    return this.handlers.get(eventType) || []
  }

  /**
   * Сортирует обработчики по приоритету
   */
  private sortHandlersByPriority(handlers: EventHandlerConfig[]): EventHandlerConfig[] {
    return handlers.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * Обрабатывает событие всеми подписчиками
   */
  private async processHandlers(event: Event, handlers: EventHandlerConfig[]): Promise<void> {
    const syncHandlers = handlers.filter(h => !h.async)
    const asyncHandlers = handlers.filter(h => h.async)
    
    // Сначала обрабатываем синхронные обработчики
    for (const handlerConfig of syncHandlers) {
      await this.executeHandler(event, handlerConfig)
    }
    
    // Затем запускаем асинхронные обработчики параллельно
    if (asyncHandlers.length > 0) {
      const asyncPromises = asyncHandlers.map(handlerConfig => 
        this.executeHandler(event, handlerConfig)
      )
      
      // Не ждем завершения асинхронных обработчиков
      Promise.allSettled(asyncPromises).then(results => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(
              `Async handler failed for event ${event.type}:`,
              result.reason
            )
          }
        })
      })
    }
  }

  /**
   * Выполняет отдельный обработчик события
   */
  private async executeHandler(
    event: Event,
    handlerConfig: EventHandlerConfig
  ): Promise<EventHandlerResult> {
    const context: EventHandlerContext = {
      event,
      attempt: 1,
    }
    
    try {
      const result = await handlerConfig.handler(context)
      
      if (!result.success && result.shouldRetry && handlerConfig.retryConfig) {
        return await this.retryHandler(context, handlerConfig)
      }
      
      return result
      
    } catch (error) {
      console.error(`Handler failed for event ${event.type}:`, error)
      
      if (handlerConfig.retryConfig) {
        context.previousError = error as Error
        return await this.retryHandler(context, handlerConfig)
      }
      
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Повторяет выполнение обработчика с задержкой
   */
  private async retryHandler(
    context: EventHandlerContext,
    handlerConfig: EventHandlerConfig
  ): Promise<EventHandlerResult> {
    const retryConfig = handlerConfig.retryConfig!
    let lastResult: EventHandlerResult = {
      success: false,
      error: context.previousError,
    }
    
    for (let attempt = 2; attempt <= retryConfig.maxAttempts; attempt++) {
      const delay = Math.min(
        retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 2),
        retryConfig.maxDelay
      )
      
      await this.sleep(delay)
      
      context.attempt = attempt
      
      try {
        lastResult = await handlerConfig.handler(context)
        
        if (lastResult.success) {
          console.log(
            `Handler succeeded on attempt ${attempt} for event ${context.event.type}`
          )
          return lastResult
        }
        
      } catch (error) {
        lastResult = {
          success: false,
          error: error as Error,
        }
        context.previousError = error as Error
      }
    }
    
    console.error(
      `Handler failed after ${retryConfig.maxAttempts} attempts for event ${context.event.type}`
    )
    
    return lastResult
  }

  /**
   * Применяет фильтры к событию
   */
  private applyFilters(event: Event, filters: EventFilter[]): boolean {
    return filters.every(filter => {
      const value = this.getNestedValue(event, filter.field)
      
      switch (filter.operator) {
        case 'eq':
          return value === filter.value
        case 'ne':
          return value !== filter.value
        case 'gt':
          return value > filter.value
        case 'lt':
          return value < filter.value
        case 'gte':
          return value >= filter.value
        case 'lte':
          return value <= filter.value
        case 'contains':
          return String(value).includes(String(filter.value))
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value)
        case 'nin':
          return Array.isArray(filter.value) && !filter.value.includes(value)
        default:
          return true
      }
    })
  }

  /**
   * Получает вложенное значение из объекта по пути
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Добавляет событие в историю
   */
  private addToHistory(event: Event): void {
    this.eventHistory.push(event)
    
    if (this.eventHistory.length > this.MAX_HISTORY_SIZE) {
      this.eventHistory.shift()
    }
  }

  /**
   * Обновляет статистику событий
   */
  private updateStats(eventType: IntegrationEventType): void {
    this.stats.totalEvents++
    this.stats.eventsByType[eventType] = (this.stats.eventsByType[eventType] || 0) + 1
    this.stats.lastProcessed = new Date().toISOString()
  }

  /**
   * Обновляет статистику времени обработки
   */
  private updateProcessingTime(processingTime: number): void {
    const currentAvg = this.stats.averageProcessingTime
    const totalEvents = this.stats.totalEvents
    
    this.stats.averageProcessingTime = 
      (currentAvg * (totalEvents - 1) + processingTime) / totalEvents
  }

  /**
   * Обновляет статистику ошибок
   */
  private updateFailureStats(): void {
    const totalEvents = this.stats.totalEvents
    const failures = totalEvents * (this.stats.failureRate / 100) + 1
    
    this.stats.failureRate = (failures / totalEvents) * 100
    this.stats.successRate = 100 - this.stats.failureRate
  }

  /**
   * Генерирует уникальный ID события
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Задержка выполнения
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
