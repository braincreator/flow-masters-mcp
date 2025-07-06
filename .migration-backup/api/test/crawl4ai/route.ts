import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const crawl4aiToken = process.env.CRAWL4AI_API_TOKEN
    const crawl4aiInternalUrl = process.env.CRAWL4AI_INTERNAL_URL

    if (!crawl4aiToken) {
      return NextResponse.json(
        { error: 'Crawl4AI API не настроен', details: 'Отсутствует CRAWL4AI_API_TOKEN' },
        { status: 500 }
      )
    }

    const testUrl = crawl4aiInternalUrl || 'http://192.168.0.4:11235'

    const response = await fetch(`${testUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${crawl4aiToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        status: 'success',
        message: `Crawl4AI API доступен. Версия: ${data.version || 'неизвестна'}`,
        details: {
          url: testUrl,
          hasToken: !!crawl4aiToken,
          responseStatus: response.status,
          health: data
        }
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Crawl4AI API недоступен', 
          details: `HTTP ${response.status}: ${response.statusText}`,
          url: testUrl
        },
        { status: response.status }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Ошибка подключения к Crawl4AI API', 
        details: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      },
      { status: 500 }
    )
  }
}
