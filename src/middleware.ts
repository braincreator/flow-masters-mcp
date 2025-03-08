import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'

const locales = ['en', 'ru']
const defaultLocale = 'ru'

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1]
    return locale && locales.includes(locale) ? locale : defaultLocale
  }

  // Get preferred language from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || ''
  const languages = acceptLanguage
    ? acceptLanguage.split(',').map((lang) => lang.split(';')[0].trim())
    : []

  // If no locale in pathname, use the preferred locale
  return matchLocale(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for admin routes, API routes, and internal paths
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Skip static files
  ) {
    return NextResponse.next()
  }

  // Skip middleware for root path as it's handled by the root page
  if (pathname === '/') {
    return NextResponse.next()
  }

  const locale = getLocale(request)

  // Handle paths without locale
  if (!locales.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)) {
    const redirectUrl = new URL(`/${locale}${pathname}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Add locale to headers for use in layout
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
