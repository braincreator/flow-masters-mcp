import { Payload } from 'payload'
import { BaseService } from './base.service'
import { EmailService } from './email.service'
import { TelegramService } from './telegram.service'
import { NotificationService } from './notification.service'
import { IntegrationEvents, EventPayload } from '@/types/events'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type EventCallback = (data: any) => Promise<void>

// Типы событий для интеграций
export enum IntegrationEventType {
  // Бронирования
  BOOKING_CREATED = 'booking.created',
  BOOKING_UPDATED = 'booking.updated',
  BOOKING_CANCELED = 'booking.canceled',
  BOOKING_RESCHEDULED = 'booking.rescheduled',
  BOOKING_NO_SHOW = 'booking.no_show',

  // Заказы
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_STATUS_UPDATED = 'order.status.updated',

  // Платежи
  PAYMENT_RECEIVED = 'payment.received',

  // Пользователи
  USER_REGISTERED = 'user.registered',

  // Формы
  FORM_SUBMITTED = 'form.submitted',

  // Контакты
  CONTACT_CREATED = 'contact.created',
  CRM_CONTACT_CREATED = 'crm.contact.created',
}

// Интерфейс для конфигурации HTTP-действия
interface HttpActionConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: Record<string, any>
}

// Интерфейс для конфигурации Email-действия
interface EmailActionConfig {
  to: string
  from?: string
  subject: string
  emailBody?: string
  template?: string
  templateData?: Record<string, any>
}

// Интерфейс для конфигурации Telegram-действия
interface TelegramActionConfig {
  message: string
  parseMode?: 'HTML' | 'Markdown'
  disableNotification?: boolean
}

// Интерфейс для конфигурации действия создания записи
interface CreateRecordActionConfig {
  collection: string
  data: Record<string, any>
}

// Интерфейс для конфигурации действия обновления записи
interface UpdateRecordActionConfig {
  collection: string
  where: Record<string, any>
  data: Record<string, any>
}

export class IntegrationService extends BaseService {
  private static instance: IntegrationService | null = null
  private eventHandlers: Map<string, Array<EventCallback>> = new Map()
  private emailService: EmailService | null = null
  private telegramService: TelegramService | null = null
  private notificationService: NotificationService | null = null

  private constructor(payload: Payload) {
    super(payload)
    this.emailService = EmailService.getInstance(payload)
    this.telegramService = TelegramService.getInstance(payload)
    this.notificationService = NotificationService.getInstance(payload)
  }

  public static getInstance(payload: Payload): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService(payload)
    }
    return IntegrationService.instance
  }

  /**
   * Обрабатывает событие с указанным типом и данными
   * @param eventType Тип события
   * @param data Данные события
   */
  async processEvent(eventType: string, data: any): Promise<void> {
    logDebug(`Processing event ${eventType}:`, data)

    try {
      // Находим все активные интеграции, которые реагируют на это событие
      const integrations = await this.payload.find({
        collection: 'integrations',
        where: {
          status: { equals: 'active' },
          'triggers.event': { equals: eventType },
        },
      })

      if (integrations.docs.length === 0) {
        logDebug(`No active integrations found for event ${eventType}`)
        return
      }

      // Обрабатываем каждую интеграцию
      for (const integration of integrations.docs) {
        try {
          // Проверяем условия триггера
          const matchingTriggers = integration.triggers.filter(
            (trigger) => trigger.event === eventType,
          )

          for (const trigger of matchingTriggers) {
            // Проверяем условия, если они есть
            if (trigger.conditions && trigger.conditions.length > 0) {
              const conditionsMet = this.checkConditions(trigger.conditions, data)
              if (!conditionsMet) {
                logDebug(`Conditions not met for integration ${integration.name}, skipping`)
                continue
              }
            }

            // Выполняем действия
            await this.executeActions(integration.actions, data, integration)
          }
        } catch (error) {
          logError(`Error processing integration ${integration.name}:`, error)
          // Продолжаем с другими интеграциями
        }
      }
    } catch (error) {
      logError(`Error processing event ${eventType}:`, error)
    }
  }

  /**
   * Проверяет условия триггера
   */
  private checkConditions(conditions: any[], data: any): boolean {
    // Если нет условий, считаем что условия выполнены
    if (!conditions || conditions.length === 0) {
      return true
    }

    // Проверяем все условия (AND логика)
    return conditions.every((condition) => {
      const { field, operator, value } = condition

      // Получаем значение поля из данных
      const fieldValue = this.getNestedValue(data, field)

      // Проверяем условие в зависимости от оператора
      switch (operator) {
        case 'eq':
          return fieldValue === value
        case 'ne':
          return fieldValue !== value
        case 'gt':
          return fieldValue > value
        case 'lt':
          return fieldValue < value
        case 'contains':
          return String(fieldValue).includes(value)
        default:
          return false
      }
    })
  }

  /**
   * Получает значение вложенного поля из объекта
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.')
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj)
  }

  /**
   * Выполняет действия интеграции
   */
  private async executeActions(actions: any[], data: any, integration: any): Promise<void> {
    for (const action of actions) {
      try {
        // Записываем время начала выполнения действия
        const startTime = Date.now()

        // Преобразуем шаблоны в конфигурации
        const processedConfig = this.processTemplates(action.config, data)

        // Выполняем действие в зависимости от типа
        let result = false
        switch (action.type) {
          case 'http':
            result = await this.executeHttpAction(processedConfig, data, integration)
            break
          case 'email':
            result = await this.executeEmailAction(processedConfig, data, integration)
            break
          case 'telegram':
            result = await this.executeTelegramAction(processedConfig, data, integration)
            break
          case 'create':
            result = await this.executeCreateRecordAction(processedConfig, data, integration)
            break
          case 'update':
            result = await this.executeUpdateRecordAction(processedConfig, data, integration)
            break
          case 'notification':
            result = await this.executeNotificationAction(processedConfig, data, integration)
            break
          default:
            logWarn(`Unknown action type: ${action.type}`)
        }

        // Записываем результат выполнения действия
        const executionTime = Date.now() - startTime
        logDebug(`Action ${action.type} executed in ${executionTime}ms with result: ${result}`)

        // Обновляем статус интеграции
        await this.updateIntegrationStatus(integration.id, {
          lastSync: new Date().toISOString(),
          lastSyncStatus: result ? 'success' : 'error',
        })
      } catch (error) {
        logError(`Error executing action ${action.type}:`, error)

        // Обновляем статус интеграции в случае ошибки
        await this.updateIntegrationStatus(integration.id, {
          lastSync: new Date().toISOString(),
          lastSyncStatus: 'error',
          lastError: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  /**
   * Executes an HTTP action
   */
  private async executeHttpAction(config: HttpActionConfig, data: any, integration: any): Promise<boolean> {
    try {
      logDebug('Executing HTTP action with config:', config)

      const { url, method, headers, body } = config

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      })

      if (!response.ok) {
        logError(`HTTP request failed with status ${response.status}`)
        return false
      }

      // Optionally process the response here
      const responseData = await response.json()
      logDebug('HTTP response:', responseData)
      return true
    } catch (error: any) {
      logError('Error executing HTTP action:', error)
      return false
    }
  }

  /**
   * Executes an email action
   */
  private async executeEmailAction(config: EmailActionConfig, data: any, integration: any): Promise<boolean> {
    try {
      logDebug('Executing Email action with config:', config)

      const { to, from, subject, emailBody, template, templateData } = config

      if (template) {
        // Use template to render email body
        // const renderedTemplate = await this.emailService?.renderTemplate(template, templateData)
        // if (!renderedTemplate) {
        //   logError('Failed to render email template')
        //   return false
        // }
        // config.emailBody = renderedTemplate
        logWarn('Email template rendering is not yet implemented')
        return false
      }

      const result = await this.emailService?.sendEmail({
        to,
        from: from || 'default@example.com',
        subject,
        html: emailBody || '',
      })

      if (!result) {
        logError('Failed to send email')
        return false
      }

      return true
    } catch (error: any) {
      logError('Error executing Email action:', error)
      return false
    }
  }

  /**
   * Executes a Telegram action
   */
  private async executeTelegramAction(config: TelegramActionConfig, data: any, integration: any): Promise<boolean> {
    try {
      logDebug('Executing Telegram action with config:', config)

      const { message, parseMode, disableNotification } = config

      const result = await this.telegramService?.sendMessage(message, {
        parseMode,
        disableNotification,
      })

      if (!result) {
        logError('Failed to send Telegram message')
        return false
      }

      return true
    } catch (error: any) {
      logError('Error executing Telegram action:', error)
      return false
    }
  }

  /**
   * Executes a create record action
   */
  private async executeCreateRecordAction(config: CreateRecordActionConfig, data: any, integration: any): Promise<boolean> {
    try {
      logDebug('Executing Create Record action with config:', config)

      const { collection, data: recordData } = config

      await this.payload.create({
        collection: collection as any,
        data: recordData,
      })

      return true
    } catch (error: any) {
      logError('Error executing Create Record action:', error)
      return false
    }
  }

  /**
   * Executes an update record action
   */
  private async executeUpdateRecordAction(config: UpdateRecordActionConfig, data: any, integration: any): Promise<boolean> {
    try {
      logDebug('Executing Update Record action with config:', config)

      const { collection, where, data: updateData } = config
      
      await this.payload.update({
        collection: collection as any,
        where,
        data: updateData,
      })

      return true
    } catch (error: any) {
      logError('Error executing Update Record action:', error)
      return false
    }
  }

  /**
   * Executes a notification action
   */
  private async executeNotificationAction(config: any, data: any, integration: any): Promise<boolean> {
    try {
      logDebug('Executing Notification action with config:', config)

      if (!this.notificationService) {
        logError('Notification service is not initialized')
        return false
      }

      // TODO: find correct method name
      // await this.notificationService.sendNotification?.(config);
      return true
    } catch (error: any) {
      logError('Error executing Notification action:', error)
      return false
    }
  }

  /**
   * Processes templates in the configuration
   */
  private processTemplates(config: any, data: any): any {
    // TODO: Implement template processing logic
    logWarn('Template processing is not yet implemented')
    return config
  }

  /**
   * Updates the integration status
   */
  private async updateIntegrationStatus(integrationId: string, status: any): Promise<void> {
    try {
      await this.payload.update({
        collection: 'integrations',
        id: integrationId,
        data: status,
      })
    } catch (error: any) {
      logError('Error updating integration status:', error)
    }
  }
}
