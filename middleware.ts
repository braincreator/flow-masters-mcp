import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './src/constants'

// Move constants outside
const SKIP_PATHS = ['/admin', '/api', '/_next', '/next/preview']
const STATIC_FILE_REGEX = /\.[^/]+$/

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const locale = pathname.split('/')[1] || DEFAULT_LOCALE

  // Clone the request headers once
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  // Early return for static and system paths
  if (SKIP_PATHS.some((path) => pathname.startsWith(path)) || STATIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Root path redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url))
  }

  // Handle paths without locale
  if (!SUPPORTED_LOCALES.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)) {
    // Skip locale redirect for posts collection
    if (pathname.startsWith('/posts/')) {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }

    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url))
  }

  // Default response with locale headers
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
