/**
 * Centralized event type definitions for the integration system.
 * Used throughout the application to maintain consistency in event naming.
 */
export const IntegrationEvents = {
  // User related events
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_PROFILE_UPDATED: 'user.profile_updated',
  USER_PASSWORD_CHANGED: 'user.password_changed',
  USER_EMAIL_VERIFIED: 'user.email_verified',
  USER_DELETED: 'user.deleted',

  // Lead and form events
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_CONVERTED: 'lead.converted',
  LEAD_DELETED: 'lead.deleted',
  FORM_SUBMITTED: 'form.submitted',
  FORM_CREATED: 'form.created',
  FORM_UPDATED: 'form.updated',
  CONTACT_CREATED: 'contact.created',
  CRM_CONTACT_CREATED: 'crm.contact.created',

  // Order related events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_STATUS_UPDATED: 'order.status.updated',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_PAID: 'order.paid',
  ORDER_COMPLETED: 'order.completed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_REFUNDED: 'order.refunded',

  // Payment related events
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_PENDING: 'payment.pending',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_RECEIVED: 'payment.received', // legacy

  // Subscription events
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  SUBSCRIPTION_PAYMENT_FAILED: 'subscription.payment_failed',

  // Booking events
  BOOKING_CREATED: 'booking.created',
  BOOKING_UPDATED: 'booking.updated',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_COMPLETED: 'booking.completed',
  BOOKING_STATUS_CHANGED: 'booking.status_changed',
  BOOKING_NO_SHOW: 'booking.no_show',

  // Course and learning events
  COURSE_ENROLLED: 'course.enrolled',
  COURSE_STARTED: 'course.started',
  COURSE_COMPLETED: 'course.completed',
  COURSE_PROGRESS_UPDATED: 'course.progress_updated',
  COURSE_STALLED: 'course.stalled',
  LESSON_STARTED: 'lesson.started',
  LESSON_COMPLETED: 'lesson.completed',
  LESSON_PROGRESS_UPDATED: 'lesson.progress_updated',
  LESSON_STUCK: 'lesson.stuck',
  ACHIEVEMENT_EARNED: 'achievement.earned',
  ACHIEVEMENT_MILESTONE: 'achievement.milestone',
  CERTIFICATE_ISSUED: 'certificate.issued',
  CERTIFICATE_DOWNLOADED: 'certificate.downloaded',

  // Product related events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_PUBLISHED: 'product.published',
  PRODUCT_PRICE_CHANGED: 'product.price_changed',
  PRODUCT_PURCHASED: 'product.purchased',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_VIEWED: 'product.viewed',
  SERVICE_CREATED: 'service.created',
  SERVICE_UPDATED: 'service.updated',
  SERVICE_PUBLISHED: 'service.published',
  SERVICE_REQUESTED: 'service.requested',
  SERVICE_COMPLETED: 'service.completed',
  REVIEW_CREATED: 'review.created',
  REVIEW_UPDATED: 'review.updated',
  REVIEW_POSITIVE: 'review.positive',
  REVIEW_NEGATIVE: 'review.negative',

  // Content events
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_PUBLISHED: 'post.published',
  POST_DELETED: 'post.deleted',

  // Cart and shopping events
  CART_CREATED: 'cart.created',
  CART_ITEM_ADDED: 'cart.item_added',
  CART_ITEM_REMOVED: 'cart.item_removed',
  CART_ABANDONED: 'cart.abandoned',
  CART_RECOVERED: 'cart.recovered',
  CART_CONVERTED: 'cart.converted',

  // Marketing and communication events
  NEWSLETTER_SUBSCRIBED: 'newsletter.subscribed',
  NEWSLETTER_UNSUBSCRIBED: 'newsletter.unsubscribed',
  NEWSLETTER_RESUBSCRIBED: 'newsletter.resubscribed',
  NEWSLETTER_SENT: 'newsletter.sent',
  EMAIL_SENT: 'email.sent',
  EMAIL_OPENED: 'email.opened',
  EMAIL_CLICKED: 'email.clicked',
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_STARTED: 'campaign.started',
  CAMPAIGN_COMPLETED: 'campaign.completed',
  CAMPAIGN_HIGH_OPEN_RATE: 'campaign.high_open_rate',
  CAMPAIGN_LOW_OPEN_RATE: 'campaign.low_open_rate',

  // Project and task events
  PROJECT_CREATED: 'project.created',
  PROJECT_STARTED: 'project.started',
  PROJECT_MILESTONE: 'project.milestone',
  PROJECT_COMPLETED: 'project.completed',
  PROJECT_OVERDUE: 'project.overdue',
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  TASK_OVERDUE: 'task.overdue',

  // User behavior events
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_INACTIVE_7D: 'user.inactive_7d',
  USER_INACTIVE_30D: 'user.inactive_30d',
  USER_RETURNED: 'user.returned',
  USER_SESSION_LONG: 'user.session_long',

  // Content engagement events
  CONTENT_VIEWED: 'content.viewed',
  CONTENT_SHARED: 'content.shared',
  CONTENT_BOOKMARKED: 'content.bookmarked',
  CONTENT_DOWNLOADED: 'content.downloaded',

  // Security events
  SECURITY_LOGIN_FAILED: 'security.login_failed',
  SECURITY_MULTIPLE_FAILED: 'security.multiple_failed',
  SECURITY_PASSWORD_CHANGED: 'security.password_changed',
  SECURITY_SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',

  // System events
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning',
  SYSTEM_PERFORMANCE_SLOW: 'system.performance_slow',
  INTEGRATION_CONNECTED: 'integration.connected',
  INTEGRATION_DISCONNECTED: 'integration.disconnected',
  INTEGRATION_FAILED: 'integration.failed',
  BACKUP_STARTED: 'backup.started',
  BACKUP_COMPLETED: 'backup.completed',
  BACKUP_FAILED: 'backup.failed',

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

  // Analytics events
  ANALYTICS_GOAL_REACHED: 'analytics.goal_reached',
  ANALYTICS_CONVERSION_HIGH: 'analytics.conversion_high',
  ANALYTICS_REVENUE_MILESTONE: 'analytics.revenue_milestone',
  ANALYTICS_USER_MILESTONE: 'analytics.user_milestone',

  // Custom events
  CUSTOM: 'custom',
} as const

// Type for all possible event names
export type IntegrationEventType = (typeof IntegrationEvents)[keyof typeof IntegrationEvents]
export type IntegrationEvent = IntegrationEventType
export type IntegrationEventData = Record<string, any>

// Interface for event payloads
export interface EventPayloads {
  [IntegrationEvents.ORDER_CREATED]: {
    id: string
    orderNumber: string
    status: string
    createdAt: string
    [key: string]: any
  }
  [IntegrationEvents.ORDER_UPDATED]: {
    id: string
    orderNumber: string
    status: string
    updatedAt: string
    [key: string]: any
  }
  [IntegrationEvents.ORDER_STATUS_UPDATED]: {
    orderId: string
    status: string
    updatedAt: string
    [key: string]: any
  }
  [IntegrationEvents.PAYMENT_RECEIVED]: {
    orderId: string
    amount: number
    currency: string
    paymentMethod: string
    [key: string]: any
  }
  [IntegrationEvents.USER_REGISTERED]: {
    id: string
    email: string
    name: string
    role: string
    createdAt: string
    [key: string]: any
  }
  [IntegrationEvents.FORM_SUBMITTED]: {
    formId: string
    formTitle: string
    submission: Record<string, any>
    submittedAt: string
    [key: string]: any
  }
  [IntegrationEvents.PRODUCT_CREATED]: {
    id: string
    title: string
    price: number
    category: string
    createdAt: string
    [key: string]: any
  }
  [IntegrationEvents.PRODUCT_UPDATED]: {
    id: string
    title: string
    price: number
    category: string
    updatedAt: string
    [key: string]: any
  }
  [IntegrationEvents.CONTACT_CREATED]: {
    id: string
    email: string
    name: string
    source: string
    [key: string]: any
  }
  [IntegrationEvents.CRM_CONTACT_CREATED]: {
    id: string
    email: string
    name: string
    source: string
    [key: string]: any
  }
  [IntegrationEvents.CUSTOM]: Record<string, any>
}

// Helper type to get the payload type for a specific event
export type EventPayload<T extends IntegrationEventType> = EventPayloads[T]

// ===== РАСШИРЕННЫЕ ТИПЫ ДЛЯ СИСТЕМЫ СОБЫТИЙ =====

// Базовый интерфейс события
export interface BaseEvent {
  id: string
  type: IntegrationEventType
  timestamp: string
  source: string
  version: string
  metadata?: Record<string, any>
}

// Данные события
export interface EventData<T = any> {
  current: T
  previous?: T
  changes?: Partial<T>
  context?: Record<string, any>
}

// Полное событие
export interface Event<T = any> extends BaseEvent {
  data: EventData<T>
}

// Приоритеты событий
export enum EventPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Каналы уведомлений
export enum NotificationChannel {
  EMAIL = 'email',
  TELEGRAM = 'telegram',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp'
}

// Фильтры событий
export interface EventFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'nin'
  value: any
}

// Конфигурация повторных попыток
export interface RetryConfig {
  maxAttempts: number
  backoffMultiplier: number
  initialDelay: number
  maxDelay: number
}

// Типы для получателей уведомлений
export interface EmailRecipient {
  email: string
  name?: string
}

export interface TelegramChat {
  chatId: string
  name?: string
}

export interface SlackChannel {
  channel: string
  name?: string
}

export interface WhatsAppContact {
  phoneNumber: string
  name?: string
}

// Конфигурация подписки на события
export interface EventSubscription {
  id: string
  name: string
  description?: string
  eventTypes: IntegrationEventType[]
  channels: NotificationChannel[]
  filters?: EventFilter[]
  isActive: boolean
  webhookUrl?: string
  webhookSecret?: string
  webhookHeaders?: Record<string, string>
  emailRecipients?: EmailRecipient[]
  telegramChatIds?: TelegramChat[]
  slackChannels?: SlackChannel[]
  whatsappContacts?: WhatsAppContact[]
  priority: EventPriority
  retryConfig?: RetryConfig
  createdAt: string
  updatedAt: string
}

// Лог события
export interface EventLog {
  id: string
  eventId: string
  eventType: IntegrationEventType
  subscriptionId?: string
  channel: NotificationChannel
  status: 'pending' | 'sent' | 'failed' | 'retrying'
  attempts: number
  lastAttempt: string
  nextAttempt?: string
  error?: string
  response?: any
  createdAt: string
  updatedAt: string
}

// Webhook payload
export interface WebhookPayload {
  event: Event
  subscription: Pick<EventSubscription, 'id' | 'name'>
  timestamp: string
  signature?: string
}

// Результат обработки события
export interface EventHandlerResult {
  success: boolean
  error?: Error
  shouldRetry?: boolean
  nextRetryDelay?: number
  metadata?: Record<string, any>
}

// Контекст обработчика события
export interface EventHandlerContext {
  event: Event
  subscription?: EventSubscription
  attempt: number
  previousError?: Error
}

// Обработчик события
export type EventHandler = (context: EventHandlerContext) => Promise<EventHandlerResult>

// Конфигурация обработчика
export interface EventHandlerConfig {
  eventTypes: IntegrationEventType[]
  handler: EventHandler
  priority?: number
  async?: boolean
  retryConfig?: RetryConfig
}

// Статистика событий
export interface EventStats {
  totalEvents: number
  eventsByType: Partial<Record<IntegrationEventType, number>>
  eventsByChannel: Partial<Record<NotificationChannel, number>>
  successRate: number
  failureRate: number
  averageProcessingTime: number
  lastProcessed: string
}
