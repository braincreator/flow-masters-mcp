import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

// Default providers to use as fallback
const DEFAULT_PROVIDERS = [
  {
    id: 'yoomoney',
    name: 'YooMoney',
  },
  {
    id: 'robokassa',
    name: 'Robokassa',
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
  },
]

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const paymentService = serviceRegistry.getPaymentService()

    const settings = await paymentService.getSettings()

    // Filter out disabled providers
    const providers = (settings.providers || []).filter(
      (provider: any) => provider && provider.enabled !== false,
    )

    // Удаляем учетные данные перед отправкой клиенту
    const safeProviders = providers.map((provider: any) => ({
      id: provider.id,
      name: provider.name,
      enabled: provider.enabled !== false,
    }))

    // Return only enabled providers без учетных данных
    return NextResponse.json({
      providers: safeProviders,
      defaultProvider: settings.defaultProvider || (providers.length > 0 ? providers[0]?.id : null),
    })
  } catch (error) {
    console.error('Error getting payment providers:', error)

    // In development, return a sample Robokassa provider without exposing credentials to client
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        providers: [
          {
            id: 'robokassa',
            name: 'Robokassa (Test)',
            enabled: true,
          },
        ],
        defaultProvider: 'robokassa',
      })
    }

    // Return empty list if there's an error - don't default to showing any providers
    return NextResponse.json({
      providers: [],
      defaultProvider: null,
    })
  }
}
