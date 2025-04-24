import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/constants'
import { metricsCollector } from '@/utilities/payload/metrics'
import createMiddleware from 'next-intl/middleware'

// Move constants outside
const SKIP_PATHS = ['/admin', '/_next', '/next/preview']
const STATIC_FILE_REGEX = /\.[^/]+$/

// Создаем middleware для next-intl
const intlMiddleware = createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
})

// Наш основной middleware
export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const pathname = request.nextUrl.pathname
  const locale = pathname.split('/')[1] || DEFAULT_LOCALE

  // Clone the request headers once
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  try {
    metricsCollector.recordRequest()

    // Обрабатываем запросы к API без указания версии
    if (pathname.startsWith('/api/') && !pathname.match(/\/api\/(v\d+|admin|docs)/)) {
      // Редирект на v1 по умолчанию
      const newUrl = new URL(request.url)
      newUrl.pathname = pathname.replace('/api/', '/api/v1/')

      metricsCollector.recordOperationDuration(Date.now() - startTime)
      return NextResponse.redirect(newUrl)
    }

    // Early return for static and system paths
    if (SKIP_PATHS.some((path) => pathname.startsWith(path)) || STATIC_FILE_REGEX.test(pathname)) {
      return nextResponse(requestHeaders, startTime)
    }

    // Root path redirect
    if (pathname === '/') {
      return redirectResponse(`/${DEFAULT_LOCALE}`, request.url, startTime)
    }

    // Special case for /locale - redirect to default locale home page
    if (pathname === '/locale') {
      return redirectResponse(`/${DEFAULT_LOCALE}`, request.url, startTime)
    }

    // Handle paths without locale
    if (!SUPPORTED_LOCALES.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)) {
      // Skip locale redirect for posts collection
      if (pathname.startsWith('/posts/')) {
        return nextResponse(requestHeaders, startTime)
      }

      return redirectResponse(`/${DEFAULT_LOCALE}${pathname}`, request.url, startTime)
    }

    // Default response with locale headers
    return nextResponse(requestHeaders, startTime, pathname)
  } catch (error) {
    metricsCollector.recordError(error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

// Helper functions
function nextResponse(headers: Headers, startTime: number, pathname?: string) {
  const response = NextResponse.next({ request: { headers } })
  if (pathname) response.headers.set('x-pathname', pathname)
  metricsCollector.recordOperationDuration(Date.now() - startTime)
  return response
}

function redirectResponse(path: string, baseUrl: string, startTime: number) {
  const response = NextResponse.redirect(new URL(path, baseUrl))
  metricsCollector.recordOperationDuration(Date.now() - startTime)
  return response
}

export const config = {
  matcher: [
    // Исключаем файлы и API маршруты
    '/((?!api|_next|.*\\.).*)',
  ],
}
