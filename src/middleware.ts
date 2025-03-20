import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/constants'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const locale = pathname.split('/')[1] || DEFAULT_LOCALE

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

  // Handle paths without locale
  if (!SUPPORTED_LOCALES.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)) {
    // Skip locale redirect for posts collection
    if (pathname.startsWith('/posts/')) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
    
    const redirectUrl = new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url)
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
    // Skip all internal paths (_next, static, api, etc)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
