import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { headers } from 'next/headers'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Обработчик POST запросов для сохранения лидов
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { name, phone, email, comment, actionType, metadata } = data

    if (!name || !phone) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    const payloadClient = await getPayloadClient()

    // Получаем источник из заголовков или данных
    const source = data.source || req.headers.get('referer') || 'ai-agency-landing'

    // Собираем метаданные запроса
    const requestMetadata = {
      // Пользовательские метаданные из формы
      ...metadata,

      // Системные метаданные
      request_info: {
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        referer: req.headers.get('referer') || source,
        origin: req.headers.get('origin') || 'unknown',
        accept_language: req.headers.get('accept-language') || 'unknown',
        timestamp: new Date().toISOString(),
      },

      // UTM параметры (если переданы в metadata)
      utm_data: metadata?.utm_data || null,

      // Информация о сессии (если передана)
      session_info: metadata?.session_info || null,

      // Техническая информация
      technical_info: metadata?.technical_info || null,
    }

    const lead = await payloadClient.create({
      collection: 'leads',
      data: {
        name,
        phone,
        email: email || null,
        comment: comment || null,
        actionType: actionType || 'default',
        source,
        metadata: requestMetadata,
        status: 'new',
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (e) {
    logError('Lead form error:', e)
    return NextResponse.json({
      error: e instanceof Error ? e.message : String(e)
    }, { status: 500 })
  }
}
