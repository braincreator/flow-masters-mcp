import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

    if (!metrikaId) {
      return NextResponse.json(
        { error: 'Яндекс.Метрика не настроена', details: 'Отсутствует NEXT_PUBLIC_YANDEX_METRIKA_ID' },
        { status: 500 }
      )
    }

    // Проверяем доступность скрипта Яндекс.Метрики
    try {
      const response = await fetch('https://mc.webvisor.org/metrika/tag_ww.js', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })

      return NextResponse.json({
        status: 'success',
        message: `Яндекс.Метрика настроена. ID: ${metrikaId}`,
        details: {
          counterId: metrikaId,
          scriptAvailable: response.ok,
          responseStatus: response.status
        }
      })
    } catch (fetchError) {
      return NextResponse.json({
        status: 'success',
        message: `Яндекс.Метрика настроена. ID: ${metrikaId} (скрипт может быть заблокирован)`,
        details: {
          counterId: metrikaId,
          scriptAvailable: false,
          note: 'Скрипт заблокирован, но fallback режим будет работать'
        }
      })
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Ошибка проверки Яндекс.Метрики', 
        details: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      },
      { status: 500 }
    )
  }
}
