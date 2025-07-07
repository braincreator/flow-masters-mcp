/**
 * API endpoint для получения настроек аналитики
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { CMSAnalyticsSettings, defaultAnalyticsSettings } from '@/lib/analytics/cms-config'

export async function GET(request: NextRequest) {
  try {
    // Пока CMS не настроен, возвращаем настройки по умолчанию
    // TODO: Раскомментировать когда глобал будет добавлен в CMS
    /*
    const payload = await getPayload({ config })

    const analyticsSettings = await payload.findGlobal({
      slug: 'analytics-settings' as any,
    })

    const settings: CMSAnalyticsSettings = {
      enabled: (analyticsSettings as any).enabled ?? defaultAnalyticsSettings.enabled,
      debug: (analyticsSettings as any).debug ?? defaultAnalyticsSettings.debug,
      // ... остальные поля
    }
    */

    // Временно возвращаем настройки по умолчанию
    const settings: CMSAnalyticsSettings = {
      ...defaultAnalyticsSettings,
      // Можно переопределить из переменных окружения
      yandexMetricaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
      topMailRuId: process.env.NEXT_PUBLIC_TOP_MAIL_RU_ID,
      vkPixelIds: process.env.NEXT_PUBLIC_VK_PIXEL_ID ? [process.env.NEXT_PUBLIC_VK_PIXEL_ID] : []
    }

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Failed to fetch analytics settings:', error)

    return NextResponse.json(defaultAnalyticsSettings, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      },
    })
  }
}

// Опционально: POST endpoint для обновления настроек (если нужно)
export async function POST(request: NextRequest) {
  try {
    // TODO: Реализовать когда CMS будет настроен
    return NextResponse.json(
      { error: 'CMS integration not yet implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Failed to update analytics settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
