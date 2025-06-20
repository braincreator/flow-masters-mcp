import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Проксирование запросов к Яндекс.Метрике для обхода блокировщиков
  if (pathname.startsWith('/metrika/') || pathname.startsWith('/ya-metrika/')) {
    const metrikaUrl = new URL('https://mc.yandex.ru')
    
    // Убираем префикс из пути
    metrikaUrl.pathname = pathname.replace(/^\/(ya-)?metrika/, '')
    metrikaUrl.search = search

    console.log(`🔄 Proxying Yandex Metrika: ${pathname} → ${metrikaUrl.toString()}`)

    return NextResponse.rewrite(metrikaUrl)
  }

  // Проксирование для счетчика просмотров
  if (pathname.startsWith('/watch/')) {
    const watchUrl = new URL('https://mc.yandex.ru')
    watchUrl.pathname = pathname
    watchUrl.search = search

    return NextResponse.rewrite(watchUrl)
  }

  // Добавляем заголовки безопасности для всех страниц
  const response = NextResponse.next()

  // Заголовки для улучшения безопасности и совместимости с Яндекс.Метрикой
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Разрешаем предварительную загрузку ресурсов Яндекс.Метрики
  response.headers.set('Link', [
    '<https://mc.yandex.ru>; rel=preconnect',
    '<https://yastatic.net>; rel=preconnect'
  ].join(', '))

  return response
}

export const config = {
  matcher: [
    // Проксируем запросы к метрике
    '/metrika/:path*',
    '/ya-metrika/:path*',
    '/watch/:path*',
    // Применяем заголовки ко всем страницам кроме API и статических файлов
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
