import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayloadClient()
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: 'ID настроек Calendly не указан' }, { status: 400 })
    }

    // Используем импортированный экземпляр Payload

    // Получаем настройки Calendly из коллекции
    const calendlySettings = await payload.findByID({
      collection: 'calendly-settings',
      id,
    })

    if (!calendlySettings) {
      return NextResponse.json({ error: 'Настройки Calendly не найдены' }, { status: 404 })
    }

    // Проверяем, активны ли настройки
    if (!calendlySettings.isActive) {
      return NextResponse.json({ error: 'Настройки Calendly неактивны' }, { status: 403 })
    }

    // Обновляем дату последнего использования
    try {
      await payload.update({
        collection: 'calendly-settings',
        id,
        data: {
          lastUsed: new Date().toISOString(),
        },
      })
    } catch (updateError) {
      console.error('Ошибка при обновлении даты последнего использования:', updateError)
      // Продолжаем выполнение, так как это не критичная ошибка
    }

    // Возвращаем настройки
    return NextResponse.json({
      status: 'success',
      data: {
        username: calendlySettings.username,
        eventType: calendlySettings.eventType,
        hideEventTypeDetails: calendlySettings.hideEventTypeDetails,
        hideGdprBanner: calendlySettings.hideGdprBanner,
      },
    })
  } catch (error) {
    console.error('Ошибка при получении настроек Calendly:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Внутренняя ошибка сервера',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    )
  }
}
