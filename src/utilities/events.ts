import type { IntegrationEventType, EventFilter } from '@/types/events'

/**
 * Утилиты для работы с событиями
 */

/**
 * Валидирует тип события
 */
export function isValidEventType(eventType: string): eventType is IntegrationEventType {
  const validEventTypes = [
    // User events
    'user.registered', 'user.login', 'user.logout', 'user.profile_updated',
    'user.password_changed', 'user.email_verified', 'user.account_deleted',
    
    // Lead events
    'lead.created', 'lead.updated', 'lead.converted', 'lead.deleted',
    'lead.assigned', 'lead.status_changed', 'lead.contacted',
    
    // Form events
    'form.submitted', 'form.created', 'form.updated', 'form.deleted',
    'form.validation_failed', 'form.spam_detected',
    
    // Order events
    'order.created', 'order.updated', 'order.cancelled', 'order.completed',
    'order.shipped', 'order.delivered', 'order.refunded',
    
    // Payment events
    'payment.initiated', 'payment.completed', 'payment.failed', 'payment.refunded',
    'payment.disputed', 'payment.cancelled',
    
    // Subscription events
    'subscription.created', 'subscription.updated', 'subscription.cancelled',
    'subscription.renewed', 'subscription.expired', 'subscription.trial_started',
    'subscription.trial_ended', 'subscription.payment_failed',
    
    // Booking events
    'booking.created', 'booking.updated', 'booking.cancelled', 'booking.confirmed',
    'booking.completed', 'booking.no_show', 'booking.rescheduled',
    
    // Course events
    'course.enrolled', 'course.completed', 'course.progress_updated',
    'course.certificate_issued', 'course.dropped_out',
    
    // System events
    'system.error', 'system.warning', 'system.maintenance', 'system.backup',
    'system.integration_failed', 'system.test',
  ]
  
  return validEventTypes.includes(eventType as IntegrationEventType)
}

/**
 * Валидирует фильтр события
 */
export function validateEventFilter(filter: EventFilter): boolean {
  if (!filter.field || typeof filter.field !== 'string') {
    return false
  }
  
  const validOperators = ['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'contains', 'in', 'nin']
  if (!validOperators.includes(filter.operator)) {
    return false
  }
  
  if (filter.value === undefined || filter.value === null) {
    return false
  }
  
  return true
}

/**
 * Безопасно получает вложенное значение из объекта
 */
export function safeGetNestedValue(obj: any, path: string, defaultValue: any = undefined): any {
  try {
    return path.split('.').reduce((current, key) => {
      if (current === null || current === undefined) {
        return defaultValue
      }
      return current[key]
    }, obj)
  } catch (error) {
    return defaultValue
  }
}

/**
 * Форматирует событие для отображения
 */
export function formatEventForDisplay(event: any): string {
  const timestamp = new Date(event.timestamp).toLocaleString('ru-RU')
  const eventType = event.type || 'unknown'
  const eventId = event.id || 'unknown'
  
  return `[${timestamp}] ${eventType} (${eventId})`
}

/**
 * Создает краткое описание события для уведомлений
 */
export function createEventSummary(event: any): string {
  const eventType = event.type || 'unknown'
  const data = event.data?.current || {}
  
  switch (eventType) {
    case 'lead.created':
      return `Новый лид: ${data.name || 'Неизвестно'} (${data.phone || data.email || 'Нет контактов'})`
    
    case 'form.submitted':
      return `Отправлена форма: ${data.formTitle || 'Неизвестная форма'}`
    
    case 'order.created':
      return `Новый заказ: ${data.id || 'Неизвестно'} на сумму ${data.total || 'Неизвестно'}`
    
    case 'payment.completed':
      return `Оплата завершена: ${data.amount || 'Неизвестно'} ${data.currency || ''}`
    
    case 'user.registered':
      return `Новый пользователь: ${data.email || data.name || 'Неизвестно'}`
    
    case 'subscription.created':
      return `Новая подписка: ${data.plan || 'Неизвестный план'}`
    
    case 'booking.created':
      return `Новое бронирование: ${data.service || 'Неизвестная услуга'} на ${data.date || 'Неизвестную дату'}`
    
    case 'course.enrolled':
      return `Запись на курс: ${data.courseTitle || 'Неизвестный курс'}`
    
    default:
      return `Событие: ${eventType}`
  }
}

/**
 * Определяет приоритет события
 */
export function getEventPriority(eventType: IntegrationEventType): 'low' | 'normal' | 'high' | 'critical' {
  const highPriorityEvents = [
    'payment.failed', 'payment.disputed', 'order.cancelled',
    'subscription.payment_failed', 'system.error'
  ]
  
  const criticalEvents = [
    'system.integration_failed', 'payment.refunded'
  ]
  
  const lowPriorityEvents = [
    'user.login', 'user.logout', 'course.progress_updated', 'system.test'
  ]
  
  if (criticalEvents.includes(eventType)) {
    return 'critical'
  }
  
  if (highPriorityEvents.includes(eventType)) {
    return 'high'
  }
  
  if (lowPriorityEvents.includes(eventType)) {
    return 'low'
  }
  
  return 'normal'
}

/**
 * Создает уникальный ID для события
 */
export function generateEventId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  return `evt_${timestamp}_${random}`
}

/**
 * Валидирует webhook URL
 */
export function validateWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch (error) {
    return false
  }
}

/**
 * Валидирует номер телефона для WhatsApp
 */
export function validateWhatsAppPhoneNumber(phoneNumber: string): boolean {
  // Очищаем номер от всех символов кроме цифр и +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '')

  // Проверяем базовый формат: + и от 10 до 15 цифр
  const phoneRegex = /^\+\d{10,15}$/
  return phoneRegex.test(cleaned)
}

/**
 * Форматирует номер телефона для WhatsApp
 */
export function formatWhatsAppPhoneNumber(phoneNumber: string): string {
  // Убираем все символы кроме цифр и +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '')

  // Если номер начинается с 8, заменяем на +7 (для России)
  if (cleaned.startsWith('8')) {
    cleaned = '+7' + cleaned.substring(1)
  }

  // Если номер не начинается с +, добавляем +7 (для России по умолчанию)
  if (!cleaned.startsWith('+')) {
    cleaned = '+7' + cleaned
  }

  return cleaned
}

/**
 * Создает подпись для webhook
 */
export function createWebhookSignature(payload: string, secret: string): string {
  const crypto = require('crypto')
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

/**
 * Проверяет подпись webhook
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createWebhookSignature(payload, secret)
  const crypto = require('crypto')
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    return false
  }
}

/**
 * Маскирует чувствительные данные в событии
 */
export function maskSensitiveData(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard', 'ssn']
  
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const masked = { ...data }
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      masked[key] = '***MASKED***'
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key])
    }
  }
  
  return masked
}

/**
 * Проверяет, является ли событие дубликатом
 */
export function isDuplicateEvent(event: any, recentEvents: any[], timeWindowMs: number = 60000): boolean {
  const eventTime = new Date(event.timestamp).getTime()
  
  return recentEvents.some(recentEvent => {
    const recentTime = new Date(recentEvent.timestamp).getTime()
    const timeDiff = Math.abs(eventTime - recentTime)
    
    return (
      timeDiff < timeWindowMs &&
      recentEvent.type === event.type &&
      JSON.stringify(recentEvent.data) === JSON.stringify(event.data)
    )
  })
}

/**
 * Создает контекст для события
 */
export function createEventContext(req?: any): Record<string, any> {
  const context: Record<string, any> = {
    timestamp: new Date().toISOString(),
    source: 'flowmasters',
    version: '1.0',
  }
  
  if (req) {
    context.userId = req.user?.id
    context.userEmail = req.user?.email
    context.userRole = req.user?.role
    context.ipAddress = req.ip || req.connection?.remoteAddress
    context.userAgent = req.headers?.['user-agent']
  }
  
  return context
}
