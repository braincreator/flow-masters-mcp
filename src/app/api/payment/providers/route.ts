import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
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

// Sample credentials for development environment only
const DEV_ROBOKASSA_CREDENTIALS = {
  merchant_login: 'your_test_merchant_login',
  password1: 'your_test_password1',
  password2: 'your_test_password2',
  test_mode: true,
}

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const paymentService = serviceRegistry.getPaymentService()

    let settings = await paymentService.getSettings()

    // Filter out disabled providers
    const providers = (settings.providers || []).filter(
      (provider: any) => provider && provider.enabled !== false,
    )

    // In development mode, add credentials to Robokassa provider if missing
    if (process.env.NODE_ENV === 'development') {
      const robokassaProvider = providers.find((p: any) => p.id === 'robokassa')

      if (
        robokassaProvider &&
        (!robokassaProvider.credentials ||
          !robokassaProvider.credentials.merchant_login ||
          !robokassaProvider.credentials.password1)
      ) {
        console.log('Adding sample Robokassa credentials for development')
        robokassaProvider.credentials = DEV_ROBOKASSA_CREDENTIALS
      }
    }

    // Return only enabled providers
    return NextResponse.json({
      providers,
      defaultProvider: settings.defaultProvider || (providers.length > 0 ? providers[0]?.id : null),
    })
  } catch (error) {
    console.error('Error getting payment providers:', error)

    // In development, return a sample Robokassa provider with test credentials
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        providers: [
          {
            id: 'robokassa',
            name: 'Robokassa (Test)',
            enabled: true,
            credentials: DEV_ROBOKASSA_CREDENTIALS,
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
