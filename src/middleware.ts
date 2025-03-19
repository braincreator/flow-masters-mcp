import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'

const locales = ['en', 'ru']
const defaultLocale = 'ru'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const locale = pathname.split('/')[1] || 'ru'

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  // Skip middleware for admin routes, API routes, internal paths, and preview routes
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/next/preview') ||
    pathname.includes('.') // Skip static files
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Skip middleware for root path as it's handled by the root page
  if (pathname === '/') {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Redirect /locale/ to /locale/home
  if (locales.includes(locale) && (pathname === `/${locale}` || pathname === `/${locale}/`)) {
    const redirectUrl = new URL(`/${locale}/home`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle paths without locale
  if (!locales.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)) {
    // Skip locale redirect for posts collection
    if (pathname.startsWith('/posts/')) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
    
    const redirectUrl = new URL(`/${locale}${pathname}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Add locale to headers for use in layout
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
