import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getLocale } from '@/utilities/i18n'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * GET /api/services
 * Получение списка услуг
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const slug = searchParams.get('slug')
    const locale = getLocale(request) as 'en' | 'ru'
    const requiresBooking = searchParams.get('requiresBooking')
    const requiresPayment = searchParams.get('requiresPayment')
    const businessStatus = searchParams.get('businessStatus') || searchParams.get('status')

    const payload = await getPayloadClient()

    // Формируем условия запроса
    const where: any = {}

    // Используем только businessStatus, так как versions отключены
    if (businessStatus) {
      where.businessStatus = {
        equals: businessStatus,
      }
    } else {
      // По умолчанию показываем только активные услуги
      where.businessStatus = {
        in: ['active'],
      }
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

    // Не используем draft: true, так как это ограничивает результаты только черновиками
    // Вместо этого полагаемся на фильтр where.status

    logDebug('[API /services] Effective locale for query:', locale)
    logDebug('[API /services] Business status filter:', businessStatus)
    logDebug('[API /services] Query where clause:', JSON.stringify(where, null, 2))
    logDebug('[API /services] Payload find options:', JSON.stringify(findOptions, null, 2))

    // Добавляем обработку таймаута для безопасности
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Services query timeout')), 30000)
    })

    const servicesPromise = payload.find(findOptions)

    const services = await Promise.race([servicesPromise, timeoutPromise])

    // Log successful fetch for debugging
    logDebug('[API /services] Successfully fetched services:', (services as any).docs.length)

    return NextResponse.json(services)
  } catch (error) {
    logError('Error fetching services:', error)

    // Provide more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    logError('Error details:', {
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
 * POST /api/services
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
    logError('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
