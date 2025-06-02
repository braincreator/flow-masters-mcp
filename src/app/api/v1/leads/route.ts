import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

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

    const lead = await payloadClient.create({
      collection: 'leads',
      data: {
        name,
        phone,
        email: email || null,
        comment: comment || null,
        actionType: actionType || 'default',
        source,
        metadata: metadata || null,
        status: 'new',
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (e) {
    console.error('Lead form error:', e)
    return NextResponse.json({
      error: e instanceof Error ? e.message : String(e)
    }, { status: 500 })
  }
}
