import { NextResponse } from 'next/server'
import { getServerSideURL } from './getURL'
import { CORS_CONFIG, ENV_CORS_CONFIG } from '@/config/cors'

/**
 * Get allowed origins based on environment
 */
export function getAllowedOrigins(): string[] {
  const serverUrl = getServerSideURL()
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const origins = [
    serverUrl,
    ...CORS_CONFIG.PRODUCTION_ORIGINS,
    ...CORS_CONFIG.ECOSYSTEM_ORIGINS,
    ...CORS_CONFIG.MONITORING_ORIGINS,
    ...(isDevelopment ? CORS_CONFIG.DEVELOPMENT_ORIGINS : []),
  ].filter(Boolean)

  // Remove duplicates
  return [...new Set(origins)]
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  
  const allowedOrigins = getAllowedOrigins()
  return allowedOrigins.includes(origin)
}

/**
 * Get CORS headers for API responses
 */
export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins()
  
  // Determine the origin to allow
  let allowOrigin = '*'
  
  if (origin && isOriginAllowed(origin)) {
    allowOrigin = origin
  } else if (process.env.NODE_ENV === 'production') {
    // In production, default to the main domain if no valid origin
    allowOrigin = 'https://flow-masters.ru'
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': CORS_CONFIG.ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.ALLOWED_HEADERS.join(', '),
    'Access-Control-Expose-Headers': CORS_CONFIG.EXPOSED_HEADERS.join(', '),
    'Access-Control-Allow-Credentials': CORS_CONFIG.ALLOW_CREDENTIALS.toString(),
    'Access-Control-Max-Age': CORS_CONFIG.MAX_AGE.toString(),
    'Vary': 'Origin',
  }
}

/**
 * Create CORS preflight response
 */
export function createCorsPreflightResponse(origin?: string | null): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}

/**
 * Add CORS headers to existing response
 */
export function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  const corsHeaders = getCorsHeaders(origin)
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * Create API response with CORS headers
 */
export function createCorsResponse(
  data: any,
  options: {
    status?: number
    origin?: string | null
    headers?: Record<string, string>
  } = {}
): NextResponse {
  const { status = 200, origin, headers = {} } = options
  
  const corsHeaders = getCorsHeaders(origin)
  const allHeaders = { ...corsHeaders, ...headers }
  
  return NextResponse.json(data, {
    status,
    headers: allHeaders,
  })
}

/**
 * Middleware function to handle CORS for API routes
 */
export function withCors(
  handler: (request: Request, context?: any) => Promise<NextResponse> | NextResponse
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    const origin = request.headers.get('origin')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return createCorsPreflightResponse(origin)
    }
    
    // Execute the handler
    const response = await handler(request, context)
    
    // Add CORS headers to the response
    return addCorsHeaders(response, origin)
  }
}