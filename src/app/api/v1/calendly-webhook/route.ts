import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import crypto from 'crypto'

// Типы для событий Calendly
type CalendlyEvent = {
  event: string
  payload: {
    event_type?: {
      uri?: string
      name?: string
    }
    scheduled_event?: {
      uri?: string
      name?: string
      start_time?: string
      end_time?: string
      location?: {
        type?: string
        location?: string
      }
    }
    invitee?: {
      name?: string
      email?: string
      text_reminder_number?: string
      timezone?: string
      questions_and_answers?: Array<{
        question?: string
        answer?: string
      }>
    }
    tracking?: {
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
      utm_content?: string
      utm_term?: string
    }
    old_event?: any
    new_event?: any
    cancellation?: {
      reason?: string
      canceled_by?: string
    }
  }
  created_at?: string
}

// Функция для проверки подписи Calendly
const verifyCalendlySignature = (
  signature: string,
  body: string,
  secret: string
): boolean => {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(body).digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    )
  } catch (error) {
    console.error('Ошибка при проверке подписи Calendly:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    // Получаем сигнатуру из заголовка
    const signature = req.headers.get('Calendly-Webhook-Signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Отсутствует подпись Calendly' },
        { status: 401 }
      )
    }
    
    // Получаем тело запроса
    const body = await req.text()
    const event: CalendlyEvent = JSON.parse(body)
    
    // Проверяем тип события
    if (!event.event) {
      return NextResponse.json(
        { error: 'Неверный формат события' },
        { status: 400 }
      )
    }
    
    // Находим настройки Calendly с соответствующим webhook URL
    const calendlySettings = await payload.find({
      collection: 'calendly-settings',
      where: {
        isActive: { equals: true },
      },
    })
    
    if (!calendlySettings.docs || calendlySettings.docs.length === 0) {
      return NextResponse.json(
        { error: 'Настройки Calendly не найдены' },
        { status: 404 }
      )
    }
    
    // Проверяем подпись для каждой настройки
    let isValidSignature = false
    let validSettings = null
    
    for (const settings of calendlySettings.docs) {
      if (settings.webhookSecret && verifyCalendlySignature(signature, body, settings.webhookSecret)) {
        isValidSignature = true
        validSettings = settings
        break
      }
    }
    
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Недействительная подпись' },
        { status: 401 }
      )
    }
    
    // Обрабатываем различные типы событий
    switch (event.event) {
      case 'invitee.created':
        // Новое бронирование
        await handleBookingCreated(event, validSettings)
        break
        
      case 'invitee.canceled':
        // Отмена бронирования
        await handleBookingCanceled(event, validSettings)
        break
        
      case 'invitee.rescheduled':
        // Перенос бронирования
        await handleBookingRescheduled(event, validSettings)
        break
        
      default:
        // Другие события
        console.log(`Получено событие Calendly: ${event.event}`)
    }
    
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Ошибка при обработке webhook от Calendly:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Внутренняя ошибка сервера',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 }
    )
  }
}

// Обработчик создания нового бронирования
async function handleBookingCreated(event: CalendlyEvent, settings: any) {
  try {
    // Создаем запись о бронировании в CMS
    await payload.create({
      collection: 'bookings',
      data: {
        type: 'calendly',
        status: 'confirmed',
        title: `Встреча: ${event.payload.invitee?.name || 'Без имени'}`,
        startTime: event.payload.scheduled_event?.start_time,
        endTime: event.payload.scheduled_event?.end_time,
        eventName: event.payload.scheduled_event?.name,
        location: event.payload.scheduled_event?.location?.type,
        invitee: {
          name: event.payload.invitee?.name,
          email: event.payload.invitee?.email,
          phone: event.payload.invitee?.text_reminder_number,
          timezone: event.payload.invitee?.timezone,
        },
        questions: event.payload.invitee?.questions_and_answers,
        calendlyEventUri: event.payload.scheduled_event?.uri,
        calendlyEventTypeUri: event.payload.event_type?.uri,
        source: event.payload.tracking?.utm_source,
        medium: event.payload.tracking?.utm_medium,
        campaign: event.payload.tracking?.utm_campaign,
        settingsId: settings.id,
        rawData: JSON.stringify(event),
      },
    })
    
    console.log('Создана новая запись о бронировании')
    
    // Здесь можно добавить отправку уведомлений, например, по email
    
  } catch (error) {
    console.error('Ошибка при обработке нового бронирования:', error)
  }
}

// Обработчик отмены бронирования
async function handleBookingCanceled(event: CalendlyEvent, settings: any) {
  try {
    // Находим существующую запись о бронировании
    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        calendlyEventUri: { equals: event.payload.scheduled_event?.uri },
      },
    })
    
    if (bookings.docs && bookings.docs.length > 0) {
      // Обновляем статус бронирования
      await payload.update({
        collection: 'bookings',
        id: bookings.docs[0].id,
        data: {
          status: 'canceled',
          cancellationReason: event.payload.cancellation?.reason,
          canceledBy: event.payload.cancellation?.canceled_by,
          updatedAt: new Date().toISOString(),
        },
      })
      
      console.log('Обновлен статус бронирования на "отменено"')
    }
    
  } catch (error) {
    console.error('Ошибка при обработке отмены бронирования:', error)
  }
}

// Обработчик переноса бронирования
async function handleBookingRescheduled(event: CalendlyEvent, settings: any) {
  try {
    // Находим существующую запись о бронировании
    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        calendlyEventUri: { equals: event.payload.old_event?.uri },
      },
    })
    
    if (bookings.docs && bookings.docs.length > 0) {
      // Обновляем данные бронирования
      await payload.update({
        collection: 'bookings',
        id: bookings.docs[0].id,
        data: {
          status: 'rescheduled',
          startTime: event.payload.new_event?.start_time,
          endTime: event.payload.new_event?.end_time,
          calendlyEventUri: event.payload.new_event?.uri,
          updatedAt: new Date().toISOString(),
          previousStartTime: event.payload.old_event?.start_time,
          previousEndTime: event.payload.old_event?.end_time,
        },
      })
      
      console.log('Обновлены данные перенесенного бронирования')
    }
    
  } catch (error) {
    console.error('Ошибка при обработке переноса бронирования:', error)
  }
}
