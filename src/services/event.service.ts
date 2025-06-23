import type { Payload } from 'payload'
import { BaseService } from './base.service'
import { EventBusService } from './event-bus.service'
import { WebhookService } from './webhook.service'
import { TelegramService } from './telegram.service'
import { EmailService } from './email.service'
import { WhatsAppService } from './whatsapp.service'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import type {
  Event,
  EventSubscription,
  EventFilter,
  EventHandlerResult,
  EventHandlerContext,
  IntegrationEventType,
  NotificationChannel,
  EventPriority,
  WebhookPayload,
} from '@/types/events'

/**
 * Сервис для управления событиями и подписками
 * Обеспечивает:
 * - Создание и управление подписками на события
 * - Отправку уведомлений через различные каналы
 * - Интеграцию с внешними системами через вебхуки
 * - Логирование и мониторинг событий
 */
export class EventService extends BaseService {
  private eventBus: EventBusService
  private webhookService: WebhookService
  private telegramService: TelegramService
  private emailService: EmailService
  private whatsappService: WhatsAppService

  constructor(payload: Payload) {
    super(payload)
    this.eventBus = EventBusService.getInstance(payload)
    this.webhookService = new WebhookService(payload)
    this.telegramService = new TelegramService(payload)
    this.emailService = new EmailService(payload)
    this.whatsappService = WhatsAppService.getInstance(payload)
    
    this.initializeEventHandlers()
  }

  /**
   * Инициализирует обработчики событий
   */
  private initializeEventHandlers(): void {
    // Подписываемся на все события для обработки подписок
    const allEventTypes = Object.values({
      // User events
      USER_REGISTERED: 'user.registered',
      USER_UPDATED: 'user.updated',
      USER_LOGIN: 'user.login',
      USER_LOGOUT: 'user.logout',
      USER_INACTIVE_7D: 'user.inactive_7d',
      USER_INACTIVE_30D: 'user.inactive_30d',
      USER_RETURNED: 'user.returned',

      // Lead events
      LEAD_CREATED: 'lead.created',

      // Order events
      ORDER_CREATED: 'order.created',
      ORDER_PAID: 'order.paid',
      ORDER_COMPLETED: 'order.completed',
      ORDER_CANCELLED: 'order.cancelled',
      ORDER_STATUS_CHANGED: 'order.status_changed',

      // Form events
      FORM_SUBMITTED: 'form.submitted',

      // Post events
      POST_CREATED: 'post.created',
      POST_UPDATED: 'post.updated',
      POST_PUBLISHED: 'post.published',

      // Service events
      SERVICE_CREATED: 'service.created',
      SERVICE_UPDATED: 'service.updated',
      SERVICE_PUBLISHED: 'service.published',

      // Booking events
      BOOKING_CREATED: 'booking.created',
      BOOKING_CONFIRMED: 'booking.confirmed',
      BOOKING_COMPLETED: 'booking.completed',
      BOOKING_CANCELLED: 'booking.cancelled',
      BOOKING_STATUS_CHANGED: 'booking.status_changed',

      // Product events
      PRODUCT_CREATED: 'product.created',
      PRODUCT_UPDATED: 'product.updated',
      PRODUCT_PUBLISHED: 'product.published',
      PRODUCT_PRICE_CHANGED: 'product.price_changed',

      // Cart events
      CART_CREATED: 'cart.created',
      CART_ITEM_ADDED: 'cart.item_added',
      CART_ITEM_REMOVED: 'cart.item_removed',
      CART_ABANDONED: 'cart.abandoned',
      CART_CONVERTED: 'cart.converted',

      // Review events
      REVIEW_CREATED: 'review.created',
      REVIEW_POSITIVE: 'review.positive',
      REVIEW_NEGATIVE: 'review.negative',

      // Course events
      COURSE_ENROLLED: 'course.enrolled',
      COURSE_STARTED: 'course.started',
      COURSE_COMPLETED: 'course.completed',
      COURSE_STALLED: 'course.stalled',

      // Lesson events
      LESSON_STARTED: 'lesson.started',
      LESSON_COMPLETED: 'lesson.completed',
      LESSON_PROGRESS_UPDATED: 'lesson.progress_updated',
      LESSON_STUCK: 'lesson.stuck',

      // Achievement events
      ACHIEVEMENT_EARNED: 'achievement.earned',
      ACHIEVEMENT_MILESTONE: 'achievement.milestone',

      // Certificate events
      CERTIFICATE_ISSUED: 'certificate.issued',

      // Newsletter events
      NEWSLETTER_SUBSCRIBED: 'newsletter.subscribed',
      NEWSLETTER_UNSUBSCRIBED: 'newsletter.unsubscribed',
      NEWSLETTER_RESUBSCRIBED: 'newsletter.resubscribed',

      // Campaign events
      CAMPAIGN_CREATED: 'campaign.created',
      CAMPAIGN_STARTED: 'campaign.started',
      CAMPAIGN_COMPLETED: 'campaign.completed',
      CAMPAIGN_HIGH_OPEN_RATE: 'campaign.high_open_rate',
      CAMPAIGN_LOW_OPEN_RATE: 'campaign.low_open_rate',

      // Project events
      PROJECT_CREATED: 'project.created',
      PROJECT_STARTED: 'project.started',
      PROJECT_COMPLETED: 'project.completed',
      PROJECT_OVERDUE: 'project.overdue',

      // Task events
      TASK_CREATED: 'task.created',
      TASK_ASSIGNED: 'task.assigned',
      TASK_COMPLETED: 'task.completed',
      TASK_OVERDUE: 'task.overdue',

      // Subscription events
      SUBSCRIPTION_CREATED: 'subscription.created',
      SUBSCRIPTION_RENEWED: 'subscription.renewed',
      SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
      SUBSCRIPTION_EXPIRED: 'subscription.expired',
      SUBSCRIPTION_PAUSED: 'subscription.paused',
      SUBSCRIPTION_PAYMENT_FAILED: 'subscription.payment_failed',
      SUBSCRIPTION_EXPIRING_SOON: 'subscription.expiring_soon',

      // Subscription payment events
      SUBSCRIPTION_PAYMENT_CREATED: 'subscription_payment.created',
      SUBSCRIPTION_PAYMENT_SUCCESSFUL: 'subscription_payment.successful',
      SUBSCRIPTION_PAYMENT_FAILED: 'subscription_payment.failed',
      SUBSCRIPTION_PAYMENT_REFUNDED: 'subscription_payment.refunded',
      SUBSCRIPTION_PAYMENT_RETRY: 'subscription_payment.retry',

      // Comment events
      COMMENT_CREATED: 'comment.created',
      COMMENT_APPROVED: 'comment.approved',
      COMMENT_REJECTED: 'comment.rejected',
      COMMENT_LIKED: 'comment.liked',
    }) as IntegrationEventType[]

    this.eventBus.subscribe({
      eventTypes: allEventTypes,
      handler: this.handleEvent.bind(this),
      priority: 100, // Высокий приоритет для системных обработчиков
      async: true, // Асинхронная обработка
      retryConfig: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 10000,
      },
    })
  }

  /**
   * Создает новую подписку на события
   */
  async createSubscription(
    subscription: Omit<EventSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EventSubscription> {
    try {
      const newSubscription = await this.payload.create({
        collection: 'event-subscriptions',
        data: {
          ...subscription,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })

      logDebug(`Created event subscription: ${newSubscription.name}`)
      return newSubscription as EventSubscription

    } catch (error) {
      logError('Error creating event subscription:', error)
      throw error
    }
  }

  /**
   * Обновляет существующую подписку
   */
  async updateSubscription(
    id: string,
    updates: Partial<EventSubscription>
  ): Promise<EventSubscription> {
    try {
      const updatedSubscription = await this.payload.update({
        collection: 'event-subscriptions',
        id,
        data: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      })

      logDebug(`Updated event subscription: ${id}`)
      return updatedSubscription as EventSubscription

    } catch (error) {
      logError('Error updating event subscription:', error)
      throw error
    }
  }

  /**
   * Удаляет подписку
   */
  async deleteSubscription(id: string): Promise<void> {
    try {
      await this.payload.delete({
        collection: 'event-subscriptions',
        id,
      })

      logDebug(`Deleted event subscription: ${id}`)

    } catch (error) {
      logError('Error deleting event subscription:', error)
      throw error
    }
  }

  /**
   * Получает список подписок с фильтрацией
   */
  async getSubscriptions(filters?: EventFilter[]): Promise<EventSubscription[]> {
    try {
      const query: any = { isActive: { equals: true } }

      // Применяем фильтры если они есть
      if (filters && filters.length > 0) {
        // Преобразуем фильтры в формат Payload
        filters.forEach(filter => {
          query[filter.field] = this.convertFilterToPayloadQuery(filter)
        })
      }

      const result = await this.payload.find({
        collection: 'event-subscriptions',
        where: query,
        limit: 1000,
      })

      return result.docs as EventSubscription[]

    } catch (error) {
      logError('Error getting event subscriptions:', error)
      throw error
    }
  }

  /**
   * Тестирует подписку отправкой тестового события
   */
  async testSubscription(
    id: string,
    eventType: IntegrationEventType
  ): Promise<EventHandlerResult> {
    try {
      const subscription = await this.payload.findByID({
        collection: 'event-subscriptions',
        id,
      }) as EventSubscription

      if (!subscription) {
        throw new Error(`Subscription not found: ${id}`)
      }

      // Создаем тестовое событие
      const testEvent = this.eventBus.createEvent(eventType, {
        test: true,
        message: 'This is a test event',
        timestamp: new Date().toISOString(),
      }, {
        subscriptionTest: true,
        subscriptionId: id,
      })

      // Обрабатываем событие для данной подписки
      return await this.processEventForSubscription(testEvent, subscription)

    } catch (error) {
      logError('Error testing subscription:', error)
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Публикует событие через EventBus
   */
  async publishEvent<T>(
    eventType: IntegrationEventType,
    data: T,
    metadata?: Record<string, any>
  ): Promise<void> {
    const event = this.eventBus.createEvent(eventType, data, metadata)
    await this.eventBus.publish(event)
  }

  /**
   * Главный обработчик событий
   */
  private async handleEvent(context: EventHandlerContext): Promise<EventHandlerResult> {
    try {
      const { event } = context
      
      // Получаем активные подписки для данного типа события
      const subscriptions = await this.getSubscriptionsForEvent(event.type)
      
      if (subscriptions.length === 0) {
        return { success: true }
      }

      // Обрабатываем событие для каждой подписки
      const results = await Promise.allSettled(
        subscriptions.map(subscription => 
          this.processEventForSubscription(event, subscription)
        )
      )

      // Логируем результаты
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failureCount = results.length - successCount

      logDebug(`Event ${event.type} processed: ${successCount} success, ${failureCount} failures`)

      return { success: true }

    } catch (error) {
      logError('Error handling event:', error)
      return {
        success: false,
        error: error as Error,
        shouldRetry: true,
      }
    }
  }

  /**
   * Получает подписки для конкретного типа события
   */
  private async getSubscriptionsForEvent(
    eventType: IntegrationEventType
  ): Promise<EventSubscription[]> {
    try {
      const result = await this.payload.find({
        collection: 'event-subscriptions',
        where: {
          and: [
            { isActive: { equals: true } },
            { eventTypes: { contains: eventType } },
          ],
        },
        limit: 1000,
      })

      return result.docs as EventSubscription[]

    } catch (error) {
      logError('Error getting subscriptions for event:', error)
      return []
    }
  }

  /**
   * Обрабатывает событие для конкретной подписки
   */
  private async processEventForSubscription(
    event: Event,
    subscription: EventSubscription
  ): Promise<EventHandlerResult> {
    try {
      // Проверяем фильтры
      if (subscription.filters && !this.applyFilters(event, subscription.filters)) {
        return { success: true } // Событие отфильтровано
      }

      // Отправляем уведомления по всем каналам
      const channelResults = await Promise.allSettled(
        subscription.channels.map(channel =>
          this.sendNotification(event, subscription, channel)
        )
      )

      // Логируем результаты отправки
      await this.logEventProcessing(event, subscription, channelResults)

      const hasFailures = channelResults.some(r => r.status === 'rejected')
      
      return {
        success: !hasFailures,
        shouldRetry: hasFailures,
      }

    } catch (error) {
      logError('Error processing event for subscription:', error)
      await this.logEventError(event, subscription, error as Error)
      
      return {
        success: false,
        error: error as Error,
        shouldRetry: true,
      }
    }
  }

  /**
   * Отправляет уведомление через указанный канал
   */
  private async sendNotification(
    event: Event,
    subscription: EventSubscription,
    channel: NotificationChannel
  ): Promise<void> {
    switch (channel) {
      case NotificationChannel.EMAIL:
        await this.sendEmailNotification(event, subscription)
        break
        
      case NotificationChannel.TELEGRAM:
        await this.sendTelegramNotification(event, subscription)
        break
        
      case NotificationChannel.WEBHOOK:
        await this.sendWebhookNotification(event, subscription)
        break
        
      case NotificationChannel.SLACK:
        await this.sendSlackNotification(event, subscription)
        break

      case NotificationChannel.WHATSAPP:
        await this.sendWhatsAppNotification(event, subscription)
        break

      default:
        logWarn(`Unsupported notification channel: ${channel}`)
    }
  }

  /**
   * Отправляет email уведомление
   */
  private async sendEmailNotification(
    event: Event,
    subscription: EventSubscription
  ): Promise<void> {
    if (!subscription.emailRecipients || subscription.emailRecipients.length === 0) {
      return
    }

    const subject = `FlowMasters Event: ${event.type}`
    const content = this.formatEventForEmail(event)

    for (const recipient of subscription.emailRecipients) {
      await this.emailService.sendEmail({
        to: recipient.email,
        subject,
        html: content,
      })
    }
  }

  /**
   * Отправляет Telegram уведомление
   */
  private async sendTelegramNotification(
    event: Event,
    subscription: EventSubscription
  ): Promise<void> {
    if (!subscription.telegramChatIds || subscription.telegramChatIds.length === 0) {
      return
    }

    const message = this.formatEventForTelegram(event)

    for (const chat of subscription.telegramChatIds) {
      await this.telegramService.sendMessage(chat.chatId, message)
    }
  }

  /**
   * Отправляет webhook уведомление
   */
  private async sendWebhookNotification(
    event: Event,
    subscription: EventSubscription
  ): Promise<void> {
    if (!subscription.webhookUrl) {
      return
    }

    const payload: WebhookPayload = {
      event,
      subscription: {
        id: subscription.id,
        name: subscription.name,
      },
      timestamp: new Date().toISOString(),
    }

    await this.webhookService.sendWebhook(subscription.webhookUrl, payload, {
      secret: subscription.webhookSecret,
      headers: subscription.webhookHeaders,
    })
  }

  /**
   * Отправляет Slack уведомление
   */
  private async sendSlackNotification(
    event: Event,
    subscription: EventSubscription
  ): Promise<void> {
    // TODO: Реализовать Slack интеграцию
    logDebug('Slack notifications not implemented yet')
  }

  /**
   * Отправляет WhatsApp уведомление
   */
  private async sendWhatsAppNotification(
    event: Event,
    subscription: EventSubscription
  ): Promise<void> {
    if (!subscription.whatsappContacts || subscription.whatsappContacts.length === 0) {
      return
    }

    const message = this.formatEventForWhatsApp(event)

    for (const contact of subscription.whatsappContacts) {
      const result = await this.whatsappService.sendMessage(contact.phoneNumber, message)

      if (!result.success) {
        logError(`Failed to send WhatsApp message to ${contact.phoneNumber}:`, result.error)
      }
    }
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
          return Number(value) > Number(filter.value)
        case 'lt':
          return Number(value) < Number(filter.value)
        case 'gte':
          return Number(value) >= Number(filter.value)
        case 'lte':
          return Number(value) <= Number(filter.value)
        case 'contains':
          return String(value).includes(String(filter.value))
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value)
        case 'nin':
          return Array.isArray(filter.value) && !filter.value.includes(value)
        default:
          logWarn(`Unknown filter operator: ${filter.operator}`)
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
   * Преобразует фильтр в формат запроса Payload
   */
  private convertFilterToPayloadQuery(filter: EventFilter): any {
    switch (filter.operator) {
      case 'eq':
        return { equals: filter.value }
      case 'ne':
        return { not_equals: filter.value }
      case 'gt':
        return { greater_than: filter.value }
      case 'lt':
        return { less_than: filter.value }
      case 'gte':
        return { greater_than_or_equal: filter.value }
      case 'lte':
        return { less_than_or_equal: filter.value }
      case 'contains':
        return { contains: filter.value }
      case 'in':
        return { in: filter.value }
      case 'nin':
        return { not_in: filter.value }
      default:
        return { equals: filter.value }
    }
  }

  /**
   * Форматирует событие для email
   */
  private formatEventForEmail(event: Event): string {
    return `
      <h2>Новое событие: ${event.type}</h2>
      <p><strong>Время:</strong> ${new Date(event.timestamp).toLocaleString('ru-RU')}</p>
      <p><strong>ID:</strong> ${event.id}</p>
      <h3>Данные:</h3>
      <pre>${JSON.stringify(event.data, null, 2)}</pre>
    `
  }

  /**
   * Форматирует событие для Telegram
   */
  private formatEventForTelegram(event: Event): string {
    return `
🔔 *Новое событие*

*Тип:* ${event.type}
*Время:* ${new Date(event.timestamp).toLocaleString('ru-RU')}
*ID:* ${event.id}

*Данные:*
\`\`\`json
${JSON.stringify(event.data, null, 2)}
\`\`\`
    `.trim()
  }

  /**
   * Форматирует событие для WhatsApp
   */
  private formatEventForWhatsApp(event: Event): string {
    const eventSummary = this.createEventSummary(event)
    const timestamp = new Date(event.timestamp).toLocaleString('ru-RU')

    return `🔔 *${eventSummary}*

*Время:* ${timestamp}
*ID события:* ${event.id}

${this.formatEventDataForWhatsApp(event.data)}`.trim()
  }

  /**
   * Создает краткое описание события
   */
  private createEventSummary(event: Event): string {
    const eventType = event.type
    const data = event.data?.current || {}

    switch (eventType) {
      case 'lead.created':
        return `Новый лид: ${data.name || 'Неизвестно'}`
      case 'form.submitted':
        return `Отправлена форма: ${data.formTitle || 'Неизвестная форма'}`
      case 'order.created':
        return `Новый заказ на сумму ${data.total || 'Неизвестно'}`
      case 'payment.completed':
        return `Оплата завершена: ${data.amount || 'Неизвестно'}`
      case 'user.registered':
        return `Новый пользователь: ${data.email || data.name || 'Неизвестно'}`
      default:
        return `Событие: ${eventType}`
    }
  }

  /**
   * Форматирует данные события для WhatsApp
   */
  private formatEventDataForWhatsApp(data: any): string {
    if (!data?.current) return ''

    const current = data.current
    const lines: string[] = []

    // Основные поля
    if (current.name) lines.push(`👤 *Имя:* ${current.name}`)
    if (current.phone) lines.push(`📞 *Телефон:* ${current.phone}`)
    if (current.email) lines.push(`📧 *Email:* ${current.email}`)
    if (current.comment) lines.push(`💬 *Комментарий:* ${current.comment}`)
    if (current.source) lines.push(`🔗 *Источник:* ${current.source}`)
    if (current.total) lines.push(`💰 *Сумма:* ${current.total}`)

    return lines.join('\n')
  }

  /**
   * Логирует обработку события
   */
  private async logEventProcessing(
    event: Event,
    subscription: EventSubscription,
    results: PromiseSettledResult<void>[]
  ): Promise<void> {
    try {
      for (let i = 0; i < subscription.channels.length; i++) {
        const channel = subscription.channels[i]
        const result = results[i]

        await this.payload.create({
          collection: 'event-logs',
          data: {
            eventId: event.id,
            eventType: event.type,
            subscriptionId: subscription.id,
            channel,
            status: result.status === 'fulfilled' ? 'sent' : 'failed',
            attempts: 1,
            lastAttempt: new Date().toISOString(),
            error: result.status === 'rejected' ? String(result.reason) : undefined,
            eventData: event.data,
            eventMetadata: event.metadata,
            processingTime: 0, // TODO: Измерить реальное время
          },
        })
      }
    } catch (error) {
      logError('Error logging event processing:', error)
    }
  }

  /**
   * Логирует ошибку обработки события
   */
  private async logEventError(
    event: Event,
    subscription: EventSubscription,
    error: Error
  ): Promise<void> {
    try {
      await this.payload.create({
        collection: 'event-logs',
        data: {
          eventId: event.id,
          eventType: event.type,
          subscriptionId: subscription.id,
          channel: 'system' as any, // Системная ошибка
          status: 'failed',
          attempts: 1,
          lastAttempt: new Date().toISOString(),
          error: error.message,
          eventData: event.data,
          eventMetadata: event.metadata,
        },
      })
    } catch (logError) {
      logError('Error logging event error:', logError)
    }
  }



  /**
   * Получает вложенное значение из объекта
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
}
