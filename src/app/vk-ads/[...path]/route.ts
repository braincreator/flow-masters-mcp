import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const url = `https://ads.vk.com/${path}`
    
    console.log(`[VK Ads Proxy] Fetching: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (compatible; Analytics-Proxy/1.0)',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
        'Referer': request.headers.get('referer') || 'https://flow-masters.ru',
      },
    })

    if (!response.ok) {
      console.error(`[VK Ads Proxy] Error: ${response.status} ${response.statusText}`)
      return new NextResponse(`Proxy error: ${response.status} ${response.statusText}`, {
        status: response.status
      })
    }

    const content = await response.text()
    
    // Определяем Content-Type на основе расширения файла
    let contentType = 'text/html'
    if (path.endsWith('.js')) {
      contentType = 'application/javascript; charset=utf-8'
    } else if (path.endsWith('.html')) {
      contentType = 'text/html; charset=utf-8'
    } else if (path.endsWith('.css')) {
      contentType = 'text/css; charset=utf-8'
    }

    console.log(`[VK Ads Proxy] Success: ${url} (${content.length} bytes)`)

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('[VK Ads Proxy] Fetch error:', error)
    return new NextResponse(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
