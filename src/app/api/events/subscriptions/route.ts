import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

/**
 * API для управления подписками на события
 * GET /api/events/subscriptions - получить список подписок
 * POST /api/events/subscriptions - создать подписку
 */

/**
 * Получает список подписок на события
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get('isActive')
    const eventType = searchParams.get('eventType')
    const channel = searchParams.get('channel')

    const payload = await getPayloadClient()
    const eventService = payload.services?.getEventService()

    if (!eventService) {
      return NextResponse.json(
        { error: 'Event service not available' },
        { status: 500 }
      )
    }

    // Строим фильтры
    const filters = []
    
    if (isActive !== null) {
      filters.push({
        field: 'isActive',
        operator: 'eq' as const,
        value: isActive === 'true',
      })
    }

    if (eventType) {
      filters.push({
        field: 'eventTypes',
        operator: 'contains' as const,
        value: eventType,
      })
    }

    if (channel) {
      filters.push({
        field: 'channels',
        operator: 'contains' as const,
        value: channel,
      })
    }

    const subscriptions = await eventService.getSubscriptions(filters)

    return NextResponse.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
    })

  } catch (error) {
    console.error('Error getting event subscriptions:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Создает новую подписку на события
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const {
      name,
      description,
      eventTypes,
      channels,
      priority = 'normal',
      emailRecipients,
      telegramChatIds,
      slackChannels,
      whatsappContacts,
      webhookUrl,
      webhookSecret,
      webhookHeaders,
      filters,
      retryConfig,
    } = data

    // Валидация обязательных полей
    if (!name || !eventTypes || !channels) {
      return NextResponse.json(
        { error: 'Name, eventTypes, and channels are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
      return NextResponse.json(
        { error: 'eventTypes must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json(
        { error: 'channels must be a non-empty array' },
        { status: 400 }
      )
    }

    // Валидация webhook URL если webhook канал выбран
    if (channels.includes('webhook') && !webhookUrl) {
      return NextResponse.json(
        { error: 'webhookUrl is required when webhook channel is selected' },
        { status: 400 }
      )
    }

    // Валидация email получателей если email канал выбран
    if (channels.includes('email') && (!emailRecipients || emailRecipients.length === 0)) {
      return NextResponse.json(
        { error: 'emailRecipients is required when email channel is selected' },
        { status: 400 }
      )
    }

    // Валидация Telegram чатов если Telegram канал выбран
    if (channels.includes('telegram') && (!telegramChatIds || telegramChatIds.length === 0)) {
      return NextResponse.json(
        { error: 'telegramChatIds is required when telegram channel is selected' },
        { status: 400 }
      )
    }

    // Валидация WhatsApp контактов если WhatsApp канал выбран
    if (channels.includes('whatsapp') && (!whatsappContacts || whatsappContacts.length === 0)) {
      return NextResponse.json(
        { error: 'whatsappContacts is required when whatsapp channel is selected' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()
    const eventService = payload.services?.getEventService()

    if (!eventService) {
      return NextResponse.json(
        { error: 'Event service not available' },
        { status: 500 }
      )
    }

    // Создаем подписку
    const subscription = await eventService.createSubscription({
      name,
      description,
      eventTypes,
      channels,
      priority,
      emailRecipients: emailRecipients?.map((email: string) => ({
        email,
        name: email.split('@')[0] // Используем часть до @ как имя по умолчанию
      })),
      telegramChatIds: telegramChatIds?.map((chatId: string) => ({
        chatId,
        name: `Chat ${chatId}`
      })),
      slackChannels: slackChannels?.map((channel: string) => ({
        channel,
        name: channel
      })),
      whatsappContacts: whatsappContacts?.map((contact: any) => ({
        phoneNumber: contact.phoneNumber || contact,
        name: contact.name || `Contact ${contact.phoneNumber || contact}`
      })),
      webhookUrl,
      webhookSecret,
      webhookHeaders,
      filters,
      retryConfig: retryConfig || {
        maxAttempts: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        maxDelay: 30000,
      },
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Event subscription created successfully',
    })

  } catch (error) {
    console.error('Error creating event subscription:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
