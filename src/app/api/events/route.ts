import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * API для управления событиями
 * GET /api/events - получить список событий
 * POST /api/events - создать событие вручную
 */

/**
 * Получает список событий с фильтрацией
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventType = searchParams.get('eventType')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const payload = await getPayloadClient()
    const eventService = payload.services?.getEventService()

    if (!eventService) {
      return NextResponse.json(
        { error: 'Event service not available' },
        { status: 500 }
      )
    }

    // Получаем статистику событий
    const eventBus = payload.services?.getEventBusService()
    const stats = eventBus?.getStats()

    // Получаем историю событий
    const filters = []
    if (eventType) {
      filters.push({
        field: 'type',
        operator: 'eq' as const,
        value: eventType,
      })
    }

    if (dateFrom) {
      filters.push({
        field: 'timestamp',
        operator: 'gte' as const,
        value: dateFrom,
      })
    }

    if (dateTo) {
      filters.push({
        field: 'timestamp',
        operator: 'lte' as const,
        value: dateTo,
      })
    }

    const events = await eventBus?.getEventHistory(filters) || []

    // Пагинация
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEvents = events.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        events: paginatedEvents,
        stats,
        pagination: {
          page,
          limit,
          total: events.length,
          totalPages: Math.ceil(events.length / limit),
        },
      },
    })

  } catch (error) {
    logError('Error getting events:', error)
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
 * Создает событие вручную (для тестирования)
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { eventType, eventData, metadata } = data

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
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

    // Публикуем событие
    await eventService.publishEvent(eventType, eventData || {}, {
      ...metadata,
      source: 'manual_api',
      createdBy: 'api',
    })

    return NextResponse.json({
      success: true,
      message: 'Event published successfully',
      eventType,
    })

  } catch (error) {
    logError('Error creating event:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
