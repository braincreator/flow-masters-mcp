import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Защищаем маршрут с помощью API ключа
const validateApiKey = (req: NextRequest): boolean => {
  const apiKey = req.headers.get('x-api-key')
  const validApiKey = process.env.CRON_API_KEY

  if (!validApiKey) {
    logWarn('CRON_API_KEY not configured in environment variables')
    return false
  }

  return apiKey === validApiKey
}

export async function POST(req: NextRequest) {
  // Проверяем API ключ
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Инициализация сервисов
    let payload
    try {
      payload = await getPayloadClient()
    } catch (error) {
      logError('Failed to initialize Payload client:', error)
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    logDebug('Starting subscription payments processing...')

    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const subscriptionService = serviceRegistry.getSubscriptionService()
    const results = await subscriptionService.processRecurringPayments()

    logDebug('Subscription processing completed:', results)

    return NextResponse.json({
      success: true,
      processed: results,
    })
  } catch (error) {
    logError('Error processing subscription payments:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
