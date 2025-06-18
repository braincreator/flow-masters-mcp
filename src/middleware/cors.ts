import { NextRequest, NextResponse } from 'next/server'
import { getCorsHeaders, isOriginAllowed } from '@/utilities/cors'

/**
 * CORS middleware for API routes
 * Automatically adds CORS headers to all API responses
 */
export function corsMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Only apply CORS to API routes
  if (!pathname.startsWith('/api/')) {
    return null
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  }

  // For other requests, we'll add headers in the response
  // This is handled by the response middleware
  return null
}

/**
 * Add CORS headers to API responses
 */
export function addCorsToResponse(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Only apply CORS to API routes
  if (!pathname.startsWith('/api/')) {
    return response
  }

  // Add CORS headers
  const corsHeaders = getCorsHeaders(origin)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}