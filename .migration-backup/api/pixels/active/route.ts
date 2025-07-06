import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * API для получения активных пикселей
 * GET /api/pixels/active - получить список активных пикселей
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || 'all'
    const placement = searchParams.get('placement') // head, body_start, body_end

    const payload = await getPayloadClient()

    // Строим запрос для получения активных пикселей
    const whereQuery: any = {
      isActive: { equals: true }
    }

    // Фильтр по размещению если указан
    if (placement) {
      whereQuery.placement = { equals: placement }
    }

    const result = await payload.find({
      collection: 'pixels',
      where: whereQuery,
      limit: 100,
      sort: 'loadPriority', // Сначала высокий приоритет
    })

    // Фильтруем пиксели по страницам
    const filteredPixels = result.docs.filter((pixel: any) => {
      if (!pixel.pages || pixel.pages.length === 0) return false
      return pixel.pages.includes('all') || pixel.pages.includes(page)
    })

    // Группируем по размещению для удобства
    const pixelsByPlacement = {
      head: filteredPixels.filter((p: any) => p.placement === 'head'),
      body_start: filteredPixels.filter((p: any) => p.placement === 'body_start'),
      body_end: filteredPixels.filter((p: any) => p.placement === 'body_end'),
    }

    return NextResponse.json({
      success: true,
      pixels: placement ? pixelsByPlacement[placement as keyof typeof pixelsByPlacement] : filteredPixels,
      pixelsByPlacement,
      total: filteredPixels.length,
    })

  } catch (error) {
    logError('Error getting active pixels:', error)
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
 * API для отправки событий пикселей
 * POST /api/pixels/active - отправить событие в пиксели
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { eventName, eventData, pixelTypes, page } = data

    if (!eventName) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Получаем активные пиксели
    const whereQuery: any = {
      isActive: { equals: true }
    }

    // Фильтр по типам пикселей если указан
    if (pixelTypes && Array.isArray(pixelTypes)) {
      whereQuery.type = { in: pixelTypes }
    }

    const result = await payload.find({
      collection: 'pixels',
      where: whereQuery,
      limit: 100,
    })

    // Фильтруем по страницам
    const activePixels = result.docs.filter((pixel: any) => {
      if (!pixel.pages || pixel.pages.length === 0) return false
      return pixel.pages.includes('all') || (page && pixel.pages.includes(page))
    })

    // Формируем JavaScript код для отправки событий
    const eventScripts = activePixels.map((pixel: any) => {
      return generateEventScript(pixel, eventName, eventData)
    }).filter(Boolean)

    return NextResponse.json({
      success: true,
      eventScripts,
      pixelsTriggered: activePixels.length,
      message: `Event "${eventName}" sent to ${activePixels.length} pixels`,
    })

  } catch (error) {
    logError('Error sending pixel events:', error)
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
 * Генерирует JavaScript код для отправки события в конкретный пиксель
 */
function generateEventScript(pixel: any, eventName: string, eventData: any = {}): string | null {
  switch (pixel.type) {
    case 'vk':
      const vkEventName = mapToVKEvent(eventName)
      const eventDataStr = Object.keys(eventData).length > 0 ? `, ${JSON.stringify(eventData)}` : ''
      return `
        if (typeof VK !== 'undefined' && typeof VK.Goal === 'function') {
          VK.Goal('${vkEventName}'${eventDataStr});
        }
      `

    case 'facebook':
      const fbEventName = mapToFacebookEvent(eventName)
      return `
        if (typeof fbq !== 'undefined') {
          fbq('track', '${fbEventName}', ${JSON.stringify(eventData)});
        }
      `

    case 'ga4':
      return `
        if (typeof gtag !== 'undefined') {
          gtag('event', '${eventName}', ${JSON.stringify(eventData)});
        }
      `

    case 'yandex_metrica':
      return `
        if (typeof ym !== 'undefined') {
          ym(${pixel.pixelId}, 'reachGoal', '${eventName}', ${JSON.stringify(eventData)});
        }
      `

    case 'tiktok':
      return `
        if (typeof ttq !== 'undefined') {
          ttq.track('${eventName}', ${JSON.stringify(eventData)});
        }
      `

    default:
      return null
  }
}

/**
 * Маппинг событий на стандартные события Facebook
 */
function mapToFacebookEvent(eventName: string): string {
  const eventMap: Record<string, string> = {
    'purchase': 'Purchase',
    'lead': 'Lead',
    'registration': 'CompleteRegistration',
    'add_to_cart': 'AddToCart',
    'checkout': 'InitiateCheckout',
    'view_content': 'ViewContent',
    'search': 'Search',
    'contact': 'Contact',
  }

  return eventMap[eventName.toLowerCase()] || eventName
}

/**
 * Маппинг событий на стандартные события VK Ads
 */
function mapToVKEvent(eventName: string): string {
  const eventMap: Record<string, string> = {
    'purchase': 'purchase',
    'lead': 'lead',
    'registration': 'complete_registration',
    'add_to_cart': 'add_to_cart',
    'checkout': 'initiate_checkout',
    'view_content': 'view_content',
    'search': 'search',
    'contact': 'contact',
    'page_view': 'page_view',
    'add_to_wishlist': 'add_to_wishlist',
    'add_payment_info': 'add_payment_info',
    'customize_product': 'customize_product',
    'schedule': 'schedule',
    'submit_application': 'submit_application',
    'start_trial': 'start_trial',
    'subscribe': 'subscribe',
    'find_location': 'find_location',
    'donate': 'donate',
    'conversion': 'conversion',
  }

  return eventMap[eventName.toLowerCase()] || 'conversion'
}
