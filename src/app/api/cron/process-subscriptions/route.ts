import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { SubscriptionService } from '@/services/subscription'

// Защищаем маршрут с помощью API ключа
const validateApiKey = (req: NextRequest): boolean => {
  const apiKey = req.headers.get('x-api-key')
  const validApiKey = process.env.CRON_API_KEY

  if (!validApiKey) {
    console.warn('CRON_API_KEY not configured in environment variables')
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
      console.error('Failed to initialize Payload client:', error)
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    console.log('Starting subscription payments processing...')

    const subscriptionService = new SubscriptionService(payload)
    const results = await subscriptionService.processRecurringPayments()

    console.log('Subscription processing completed:', results)

    return NextResponse.json({
      success: true,
      processed: results,
    })
  } catch (error) {
    console.error('Error processing subscription payments:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
