import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

/**
 * GET /api/v1/services
 * Получение списка услуг
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const slug = searchParams.get('slug')
    const localeParam = searchParams.get('locale')
    let locale: 'en' | 'ru' | undefined = undefined
    if (localeParam === 'en' || localeParam === 'ru') {
      locale = localeParam
    }
    const requiresBooking = searchParams.get('requiresBooking')
    const requiresPayment = searchParams.get('requiresPayment')
    const status = searchParams.get('status') || 'published'

    const payload = await getPayloadClient()

    // Формируем условия запроса
    const where: any = {
      status: {
        equals: status,
      },
    }

    // Добавляем фильтры, если они указаны
    if (type) {
      where.serviceType = {
        equals: type,
      }
    }

    if (requiresBooking) {
      where.requiresBooking = {
        equals: requiresBooking === 'true',
      }
    }

    if (requiresPayment) {
      where.requiresPayment = {
        equals: requiresPayment === 'true',
      }
    }

    // Moved slug filter to be independent
    if (slug) {
      where.slug = {
        equals: slug,
      }
    }

    // Получаем услуги с оптимизированными настройками для предотвращения бесконечной загрузки
    const findOptions: any = {
      collection: 'services',
      where,
      depth: 1, // Allow depth 1 for media population, relatedServices maxDepth prevents circular refs
    }

    if (locale) {
      findOptions.locale = locale
    }

    console.log('[API /services] Effective locale for query:', locale)
    console.log('[API /services] Query where clause:', JSON.stringify(where, null, 2))
    console.log('[API /services] Payload find options:', JSON.stringify(findOptions, null, 2))

    // Добавляем обработку таймаута для безопасности
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Services query timeout')), 30000)
    })

    const servicesPromise = payload.find(findOptions)

    const services = await Promise.race([servicesPromise, timeoutPromise])

    // Log successful fetch for debugging
    console.log('[API /services] Successfully fetched services:', (services as any).docs.length)

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)

    // Provide more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: 'Failed to fetch services',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/v1/services
 * Создание новой услуги
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const data = await request.json()

    // Создаем услугу
    const service = await payload.create({
      collection: 'services',
      data,
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
