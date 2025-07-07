import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const n8nApiKey = process.env.N8N_API_KEY
    const n8nBaseUrl = process.env.N8N_BASE_URL

    if (!n8nApiKey || !n8nBaseUrl) {
      return NextResponse.json(
        { error: 'n8n API не настроен', details: 'Отсутствуют N8N_API_KEY или N8N_BASE_URL' },
        { status: 500 }
      )
    }

    // Тестируем подключение к n8n API
    const response = await fetch(`${n8nBaseUrl}/api/workflows`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${n8nApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        status: 'success',
        message: `n8n API доступен. Найдено ${data.data?.length || 0} workflows`,
        details: {
          url: n8nBaseUrl,
          hasApiKey: !!n8nApiKey,
          responseStatus: response.status
        }
      })
    } else {
      return NextResponse.json(
        { 
          error: 'n8n API недоступен', 
          details: `HTTP ${response.status}: ${response.statusText}`,
          url: n8nBaseUrl
        },
        { status: response.status }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Ошибка подключения к n8n API', 
        details: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      },
      { status: 500 }
    )
  }
}
