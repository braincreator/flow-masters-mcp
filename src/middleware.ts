import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/constants'
import { metricsCollector } from '@/utilities/payload/metrics'
import createMiddleware from 'next-intl/middleware'
import { corsMiddleware, addCorsToResponse } from '@/middleware/cors'

// Move constants outside
const SKIP_PATHS = ['/admin', '/_next', '/next/preview']
const STATIC_FILE_REGEX = /\.[^/]+$/

// Функция для определения предпочтительного языка
function getPreferredLocale(request: NextRequest): string {
  // 1. Проверяем cookie с сохраненным языком
  const savedLocale = request.cookies.get('preferred-locale')?.value
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as any)) {
    return savedLocale
  }

  // 2. Анализируем Accept-Language заголовок
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',')
    for (const lang of languages) {
      const [language] = lang.trim().split(';')
      const code = language.split('-')[0].toLowerCase()

      if (SUPPORTED_LOCALES.includes(code as any)) {
        return code
      }
    }
  }

  return DEFAULT_LOCALE
}

// Создаем middleware для next-intl с кастомной логикой
const intlMiddleware = createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  // Кастомная функция для определения локали
  localeDetection: false, // Отключаем автоопределение next-intl
})

// Наш основной middleware
export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const pathname = request.nextUrl.pathname

  // 🎯 ДОБАВЛЕНО: Проксирование для аналитических сервисов (в самом начале, до всей остальной логики)

  // Яндекс.Метрика
  if (pathname === '/metrika/tag.js' || pathname === '/metrika/tag_ww.js') {
    const metrikaUrl = 'https://mc.webvisor.org/metrika/tag_ww.js'
    return NextResponse.rewrite(new URL(metrikaUrl))
  }
  if (pathname.startsWith('/metrika/watch')) {
    const searchParams = request.nextUrl.searchParams.toString()
    const metrikaUrl = `https://mc.webvisor.org/watch/${pathname.split('/').pop()}${searchParams ? `?${searchParams}` : ''}`
    return NextResponse.rewrite(new URL(metrikaUrl))
  }

  // VK Pixel
  if (pathname.startsWith('/vk-pixel/')) {
    const vkPath = pathname.replace('/vk-pixel/', '')
    const searchParams = request.nextUrl.searchParams.toString()
    const vkUrl = `https://vk.com/${vkPath}${searchParams ? `?${searchParams}` : ''}`
    return NextResponse.rewrite(new URL(vkUrl))
  }

  // Top.Mail.Ru
  if (pathname.startsWith('/top-mailru/')) {
    const topMailRuUrl = pathname.replace('/top-mailru/', 'https://top-fwz1.mail.ru/')
    return NextResponse.rewrite(new URL(topMailRuUrl))
  }

  // 🎯 УЛУЧШЕННАЯ ЛОГИКА: Обработка корневого домена с сохранением UTM
  if (pathname === '/' || (pathname === '' && !pathname.startsWith('/api'))) {
    const preferredLocale = getPreferredLocale(request)
    const url = new URL(request.url)

    // Сохраняем все query параметры (включая UTM-метки)
    const searchParams = url.searchParams.toString()
    const newPath = `/${preferredLocale}${searchParams ? `?${searchParams}` : ''}`

    const response = NextResponse.redirect(new URL(newPath, request.url))

    // Сохраняем выбранный язык в cookie на 1 год
    response.cookies.set('preferred-locale', preferredLocale, {
      maxAge: 365 * 24 * 60 * 60, // 1 год
      httpOnly: false, // Доступно для JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    // Сохраняем referer для аналитики
    const referer = request.headers.get('referer')
    if (referer) {
      response.headers.set('x-original-referer', referer)
    }

    metricsCollector.recordOperationDuration(Date.now() - startTime)
    return response
  }

  // Apply next-intl middleware для остальных путей
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

    // Handle CORS for API routes
    const corsResponse = corsMiddleware(request)
    if (corsResponse) {
      metricsCollector.recordOperationDuration(Date.now() - startTime)
      return corsResponse
    }

    // Handle API requests without version specified
    if (pathname.startsWith('/api/') && !pathname.match(/\/api\/(v\d+|admin|docs)/)) {
      const newUrl = new URL(request.url)
      newUrl.pathname = pathname.replace('/api/', '/api/v1/')
      metricsCollector.recordOperationDuration(Date.now() - startTime)
      return NextResponse.redirect(newUrl)
    }

    // Early return for static and system paths
    if (SKIP_PATHS.some((path) => pathname.startsWith(path)) || STATIC_FILE_REGEX.test(pathname)) {
      return nextResponse(requestHeaders, startTime, pathname, request)
    }

    // Default response with locale headers
    return nextResponse(requestHeaders, startTime, pathname, request)
  } catch (error) {
    metricsCollector.recordError(error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

// Helper function
function nextResponse(headers: Headers, startTime: number, pathname?: string, request?: NextRequest) {
  const response = NextResponse.next({ request: { headers } })
  if (pathname) response.headers.set('x-pathname', pathname)
  
  // Add CORS headers to API responses
  if (request && pathname?.startsWith('/api/')) {
    addCorsToResponse(request, response)
  }
  
  metricsCollector.recordOperationDuration(Date.now() - startTime)
  return response
}

export const config = {
  matcher: [
    // 🎯 ДОБАВЛЕНО: Аналитические сервисы проксирование
    '/metrika/:path*',
    '/vk-pixel/:path*',
    '/top-mailru/:path*',
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next (Next.js internals)
    // - .well-known (well-known files)
    // - any file with an extension (e.g., .js, .css)
    '/((?!api|_next|\.well-known|[^/]+\.[^/]+).*)',
  ],
}
