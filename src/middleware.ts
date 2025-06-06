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
  localePrefix: 'always',
})

// Наш основной middleware
export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const pathname = request.nextUrl.pathname

  // Apply next-intl middleware first
  const intlResponse = intlMiddleware(request)

  // If next-intl middleware returned a response (e.g., redirect), use it
  if (intlResponse) {
    metricsCollector.recordOperationDuration(Date.now() - startTime)
    return intlResponse
  }

  // Continue with custom middleware logic if next-intl didn't handle it
  const pathSegments = pathname.split('/').filter(Boolean)
  const locale =
    pathSegments[0] && SUPPORTED_LOCALES.includes(pathSegments[0])
      ? pathSegments[0]
      : DEFAULT_LOCALE
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  try {
    metricsCollector.recordRequest()

    // Handle API requests without version specified
    if (pathname.startsWith('/api/') && !pathname.match(/\/api\/(v\d+|admin|docs)/)) {
      const newUrl = new URL(request.url)
      newUrl.pathname = pathname.replace('/api/', '/api/v1/')
      metricsCollector.recordOperationDuration(Date.now() - startTime)
      return NextResponse.redirect(newUrl)
    }

    // Early return for static and system paths
    if (SKIP_PATHS.some((path) => pathname.startsWith(path)) || STATIC_FILE_REGEX.test(pathname)) {
      return nextResponse(requestHeaders, startTime)
    }

    // Default response with locale headers
    return nextResponse(requestHeaders, startTime, pathname)
  } catch (error) {
    metricsCollector.recordError(error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

// Helper function
function nextResponse(headers: Headers, startTime: number, pathname?: string) {
  const response = NextResponse.next({ request: { headers } })
  if (pathname) response.headers.set('x-pathname', pathname)
  metricsCollector.recordOperationDuration(Date.now() - startTime)
  return response
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next (Next.js internals)
    // - .well-known (well-known files)
    // - any file with an extension (e.g., .js, .css)
    '/((?!api|_next|\.well-known|[^/]+\.[^/]+).*)',
  ],
}
