import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * API для получения статистики webhook вызовов
 * GET /api/webhooks/stats - получить статистику
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    const eventType = searchParams.get('eventType')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const payload = await getPayloadClient()
    const webhookService = payload.services?.getWebhookService()

    if (!webhookService) {
      return NextResponse.json(
        { error: 'Webhook service not available' },
        { status: 500 }
      )
    }

    // Получаем статистику
    const stats = await webhookService.getWebhookStats({
      url: url || undefined,
      eventType: eventType || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })

    // Получаем последние логи для дополнительной информации
    const logsQuery: any = {}
    
    if (url) {
      logsQuery.url = { contains: url }
    }
    
    if (eventType) {
      logsQuery.eventType = { equals: eventType }
    }
    
    if (dateFrom || dateTo) {
      logsQuery.createdAt = {}
      if (dateFrom) {
        logsQuery.createdAt.greater_than_or_equal = dateFrom
      }
      if (dateTo) {
        logsQuery.createdAt.less_than_or_equal = dateTo
      }
    }

    const recentLogs = await payload.find({
      collection: 'webhook-logs',
      where: logsQuery,
      limit: 10,
      sort: '-createdAt',
    })

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentLogs: recentLogs.docs,
        filters: {
          url,
          eventType,
          dateFrom,
          dateTo,
        },
      },
    })

  } catch (error) {
    logError('Error getting webhook stats:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
