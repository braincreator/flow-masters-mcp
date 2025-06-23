import { Payload } from 'payload'
import { BaseService } from './base.service'
import crypto from 'crypto'
import { ENV } from '@/constants/env'
import { IntegrationService } from './integration.service'
import { IntegrationEvents } from '@/types/events'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Типы для событий Calendly API v2
export type CalendlyEventType =
  | 'invitee.created'
  | 'invitee.canceled'
  | 'invitee.rescheduled'
  | 'invitee_no_show.created'
  | 'routing_form_submission.created'

// Интерфейс для данных вебхука Calendly
export interface CalendlyWebhookPayload {
  event: string
  payload: {
    event_type?: {
      name?: string
      uuid?: string
    }
    invitee?: {
      name?: string
      email?: string
      text_reminder_number?: string
      timezone?: string
      uuid?: string
      questions_and_answers?: Array<{
        question: string
        answer: string
      }>
    }
    scheduled_event?: {
      start_time?: string
      end_time?: string
      location?: {
        type?: string
        location?: string
      }
      status?: string
      uuid?: string
      uri?: string
      cancellation?: {
        canceled_by?: string
        reason?: string
      }
    }
    old_invitee?: {
      uuid?: string
    }
    old_scheduled_event?: {
      uuid?: string
    }
    tracking?: {
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
      utm_content?: string
      utm_term?: string
      salesforce_uuid?: string
    }
    [key: string]: any
  }
  created_at: string
}

export class CalendlyService extends BaseService {
  private static instance: CalendlyService | null = null
  private integrationService: IntegrationService

  private constructor(payload: Payload) {
    super(payload)
    this.integrationService = IntegrationService.getInstance(payload)
  }

  public static getInstance(payload: Payload): CalendlyService {
    if (!CalendlyService.instance) {
      CalendlyService.instance = new CalendlyService(payload)
    }
    return CalendlyService.instance
  }

  /**
   * Проверяет подпись вебхука Calendly
   */
  public verifySignature(
    signature: string,
    timestamp: string,
    body: string,
    secret: string,
  ): boolean {
    try {
      // Создаем строку для подписи: timestamp + '.' + body
      const signatureString = `${timestamp}.${body}`

      // Создаем HMAC с использованием SHA-256 и секретного ключа
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(signatureString)

      // Получаем хеш в виде шестнадцатеричной строки
      const computedSignature = hmac.digest('hex')

      // Сравниваем вычисленную подпись с полученной
      return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(signature))
    } catch (error) {
      logError('Error verifying Calendly signature:', error)
      return false
    }
  }

  /**
   * Обрабатывает вебхук от Calendly
   */
  public async processWebhook(
    webhookData: CalendlyWebhookPayload,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { event } = webhookData

      switch (event) {
        case 'invitee.created':
          await this.handleInviteeCreated(webhookData)
          break

        case 'invitee.canceled':
          await this.handleInviteeCanceled(webhookData)
          break

        case 'invitee.rescheduled':
          await this.handleInviteeRescheduled(webhookData)
          break

        case 'invitee_no_show.created':
          await this.handleInviteeNoShow(webhookData)
          break

        case 'routing_form_submission.created':
          // Обработка отправки формы маршрутизации (если нужно)
          break

        default:
          logDebug(`Unhandled Calendly event type: ${event}`)
          return {
            success: true,
            message: `Event ${event} received but not processed`,
          }
      }

      return { success: true }
    } catch (error) {
      logError('Error processing Calendly webhook:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Обрабатывает событие создания бронирования
   */
  private async handleInviteeCreated(webhookData: CalendlyWebhookPayload): Promise<void> {
    try {
      const { payload } = webhookData
      const { invitee, event_type, scheduled_event, tracking } = payload

      if (!scheduled_event?.uuid) {
        throw new Error('Missing scheduled_event.uuid in webhook payload')
      }

      // Проверяем, существует ли уже бронирование с таким UUID
      const existingBookings = await this.payload.find({
        collection: 'bookings',
        where: {
          calendlyUUID: {
            equals: scheduled_event.uuid,
          },
        },
      })

      if (existingBookings.docs.length > 0) {
        logDebug(`Booking with UUID ${scheduled_event.uuid} already exists, skipping creation`)
        return
      }

      // Проверяем, есть ли оплаченный заказ для этого email
      let isPaid = false
      let orderId = null

      if (invitee?.email) {
        // Находим пользователя по email
        const users = await this.payload.find({
          collection: 'users',
          where: {
            email: {
              equals: invitee.email,
            },
          },
        })

        if (users.docs.length > 0) {
          const userId = users.docs[0].id

          // Ищем оплаченные заказы этого пользователя для консультаций
          const orders = await this.payload.find({
            collection: 'orders',
            where: {
              customer: {
                equals: userId,
              },
              status: {
                equals: 'paid',
              },
              // Здесь можно добавить дополнительные условия для определения заказов консультаций
              // например, по типу продукта или другим параметрам
            },
            sort: '-createdAt', // Сначала самые новые
            limit: 1,
          })

          if (orders.docs.length > 0) {
            isPaid = true
            orderId = orders.docs[0].id
          }
        }
      }

      // Создаем новое бронирование
      const booking = await this.payload.create({
        collection: 'bookings',
        data: {
          title: `Встреча: ${invitee?.name || 'Без имени'}`,
          type: 'calendly',
          status: 'confirmed',
          startTime: scheduled_event.start_time,
          endTime: scheduled_event.end_time,
          eventName: event_type?.name,
          location: scheduled_event.location?.type,
          invitee: {
            name: invitee?.name,
            email: invitee?.email,
            phone: invitee?.text_reminder_number,
            timezone: invitee?.timezone,
          },
          questions:
            invitee?.questions_and_answers?.map((qa) => ({
              question: qa.question,
              answer: qa.answer,
            })) || [],
          calendlyURI: scheduled_event.uri,
          calendlyUUID: scheduled_event.uuid,
          calendlyEventTypeURI: event_type?.uuid,
          source: tracking?.utm_source,
          medium: tracking?.utm_medium,
          campaign: tracking?.utm_campaign,
          rawData: JSON.stringify(webhookData),
          isPaid: isPaid,
          order: orderId,
        },
      })

      // Если есть связанный заказ, обновляем его статус на 'completed'
      if (orderId) {
        await this.payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            status: 'completed',
            notes: `Booking completed: ${scheduled_event.uuid}`,
          },
        })
      }

      // Вызываем событие для интеграций
      await this.integrationService.processEvent('booking.created', booking)
    } catch (error) {
      logError('Error handling invitee.created event:', error)
      throw error
    }
  }

  /**
   * Обрабатывает событие отмены бронирования
   */
  private async handleInviteeCanceled(webhookData: CalendlyWebhookPayload): Promise<void> {
    try {
      const { payload } = webhookData
      const { scheduled_event } = payload

      if (!scheduled_event?.uuid) {
        throw new Error('Missing scheduled_event.uuid in webhook payload')
      }

      // Находим бронирование по UUID
      const existingBookings = await this.payload.find({
        collection: 'bookings',
        where: {
          calendlyUUID: {
            equals: scheduled_event.uuid,
          },
        },
      })

      if (existingBookings.docs.length === 0) {
        logDebug(`Booking with UUID ${scheduled_event.uuid} not found, cannot cancel`)
        return
      }

      // Обновляем статус бронирования
      const booking = await this.payload.update({
        collection: 'bookings',
        id: existingBookings.docs[0].id,
        data: {
          status: 'canceled',
          cancellationReason: scheduled_event.cancellation?.reason || 'No reason provided',
          canceledBy: scheduled_event.cancellation?.canceled_by || 'Unknown',
          rawData: JSON.stringify(webhookData),
        },
      })

      // Вызываем событие для интеграций
      await this.integrationService.processEvent('booking.canceled', booking)
    } catch (error) {
      logError('Error handling invitee.canceled event:', error)
      throw error
    }
  }

  /**
   * Обрабатывает событие переноса бронирования
   */
  private async handleInviteeRescheduled(webhookData: CalendlyWebhookPayload): Promise<void> {
    try {
      const { payload } = webhookData
      const { scheduled_event, old_scheduled_event } = payload

      if (!scheduled_event?.uuid) {
        throw new Error('Missing scheduled_event.uuid in webhook payload')
      }

      // Находим старое бронирование по UUID
      const existingBookings = await this.payload.find({
        collection: 'bookings',
        where: {
          calendlyUUID: {
            equals: old_scheduled_event?.uuid || scheduled_event.uuid,
          },
        },
      })

      if (existingBookings.docs.length === 0) {
        logDebug(`Booking with UUID ${old_scheduled_event?.uuid || scheduled_event.uuid} not found, creating new booking instead`,  )
        // Если старое бронирование не найдено, создаем новое
        return this.handleInviteeCreated(webhookData)
      }

      const existingBooking = existingBookings.docs[0]

      // Обновляем бронирование
      const booking = await this.payload.update({
        collection: 'bookings',
        id: existingBooking.id,
        data: {
          previousStartTime: existingBooking.startTime,
          previousEndTime: existingBooking.endTime,
          startTime: scheduled_event.start_time,
          endTime: scheduled_event.end_time,
          status: 'rescheduled',
          calendlyUUID: scheduled_event.uuid,
          calendlyURI: scheduled_event.uri,
          rawData: JSON.stringify(webhookData),
        },
      })

      // Вызываем событие для интеграций
      await this.integrationService.processEvent('booking.rescheduled', booking)
    } catch (error) {
      logError('Error handling invitee.rescheduled event:', error)
      throw error
    }
  }

  /**
   * Обрабатывает событие неявки клиента
   */
  private async handleInviteeNoShow(webhookData: CalendlyWebhookPayload): Promise<void> {
    try {
      const { payload } = webhookData
      const { scheduled_event } = payload

      if (!scheduled_event?.uuid) {
        throw new Error('Missing scheduled_event.uuid in webhook payload')
      }

      // Находим бронирование по UUID
      const existingBookings = await this.payload.find({
        collection: 'bookings',
        where: {
          calendlyUUID: {
            equals: scheduled_event.uuid,
          },
        },
      })

      if (existingBookings.docs.length === 0) {
        logDebug(`Booking with UUID ${scheduled_event.uuid} not found, cannot mark as no-show`)
        return
      }

      // Обновляем статус бронирования
      const booking = await this.payload.update({
        collection: 'bookings',
        id: existingBookings.docs[0].id,
        data: {
          status: 'no-show',
          rawData: JSON.stringify(webhookData),
        },
      })

      // Вызываем событие для интеграций
      await this.integrationService.processEvent('booking.no_show', booking)
    } catch (error) {
      logError('Error handling invitee_no_show.created event:', error)
      throw error
    }
  }

  /**
   * Получает настройки Calendly по ID
   */
  public async getCalendlySettings(id: string): Promise<any> {
    try {
      return await this.payload.findByID({
        collection: 'calendly-settings',
        id,
      })
    } catch (error) {
      logError('Error fetching Calendly settings:', error)
      throw error
    }
  }

  /**
   * Получает все активные настройки Calendly
   */
  public async getAllActiveCalendlySettings(): Promise<any[]> {
    try {
      const result = await this.payload.find({
        collection: 'calendly-settings',
        where: {
          isActive: {
            equals: true,
          },
        },
      })

      return result.docs
    } catch (error) {
      logError('Error fetching active Calendly settings:', error)
      throw error
    }
  }
}
