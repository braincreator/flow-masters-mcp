import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * API для тестирования событий и подписок
 * POST /api/events/test - тестирует подписку или webhook
 */

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { type, subscriptionId, webhookUrl, eventType = 'system.test', webhookSecret } = data

    if (!type || !['subscription', 'webhook'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "subscription" or "webhook"' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    if (type === 'subscription') {
      if (!subscriptionId) {
        return NextResponse.json(
          { error: 'subscriptionId is required for subscription test' },
          { status: 400 }
        )
      }

      const eventService = payload.services?.getEventService()
      if (!eventService) {
        return NextResponse.json(
          { error: 'Event service not available' },
          { status: 500 }
        )
      }

      // Тестируем подписку
      const result = await eventService.testSubscription(subscriptionId, eventType)

      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? 'Subscription test completed successfully'
          : 'Subscription test failed',
        error: result.error?.message,
        metadata: result.metadata,
      })

    } else if (type === 'webhook') {
      if (!webhookUrl) {
        return NextResponse.json(
          { error: 'webhookUrl is required for webhook test' },
          { status: 400 }
        )
      }

      const webhookService = payload.services?.getWebhookService()
      if (!webhookService) {
        return NextResponse.json(
          { error: 'Webhook service not available' },
          { status: 500 }
        )
      }

      // Тестируем webhook
      const result = await webhookService.sendTestWebhook(webhookUrl, {
        secret: webhookSecret,
      })

      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? 'Webhook test completed successfully'
          : 'Webhook test failed',
        error: result.error?.message,
        metadata: result.metadata,
      })
    }

  } catch (error) {
    logError('Error testing event:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
