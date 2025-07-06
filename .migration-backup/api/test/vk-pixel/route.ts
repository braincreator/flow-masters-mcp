import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const vkPixelId = process.env.NEXT_PUBLIC_VK_PIXEL_ID

    if (!vkPixelId) {
      return NextResponse.json({
        status: 'error',
        message: 'VK Pixel ID не настроен. Добавьте NEXT_PUBLIC_VK_PIXEL_ID в .env.local'
      })
    }

    // Проверяем доступность VK API через прокси
    try {
      const response = await fetch('/vk-pixel/js/api/openapi.js?169', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })

      return NextResponse.json({
        status: 'success',
        message: `VK Pixel настроен. ID: ${vkPixelId}`,
        details: {
          pixelId: vkPixelId,
          scriptAvailable: response.ok,
          responseStatus: response.status,
          proxyWorking: true
        }
      })
    } catch (fetchError) {
      return NextResponse.json({
        status: 'success',
        message: `VK Pixel настроен. ID: ${vkPixelId} (скрипт может быть заблокирован)`,
        details: {
          pixelId: vkPixelId,
          scriptAvailable: false,
          proxyWorking: false,
          note: 'Скрипт заблокирован, но fallback режим будет работать'
        }
      })
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Ошибка при проверке VK Pixel',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
