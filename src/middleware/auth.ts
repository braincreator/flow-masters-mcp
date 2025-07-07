import { NextRequest, NextResponse } from 'next/server'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

/**
 * Authentication middleware for API routes
 * Provides centralized authentication handling with support for multiple auth formats
 */

// Authentication configuration
interface AuthConfig {
  // Paths that require API key authentication
  protectedPaths: string[]
  // Paths that are public (no authentication required)
  publicPaths: string[]
  // Paths that use custom authentication
  customAuthPaths: string[]
  // Enable authentication metrics
  enableMetrics: boolean
}

const AUTH_CONFIG: AuthConfig = {
  protectedPaths: [
    '/api/integrations',
    '/api/debug/',
    '/api/[collection]',
    '/api/[collection]/',
  ],
  publicPaths: [
    '/api/health',
    '/api/monitoring',
    '/api/globals/',
    '/api/send-email',
    '/api/[collection]/search',
    '/api/payment/',
    '/api/webhooks/',
  ],
  customAuthPaths: [
    '/api/revalidate',
    '/api/cron/',
  ],
  enableMetrics: true,
}

/**
 * Check if a path requires API key authentication
 */
function requiresApiKeyAuth(pathname: string): boolean {
  // Check exact matches first
  if (AUTH_CONFIG.protectedPaths.includes(pathname)) {
    return true
  }

  // Check pattern matches
  return AUTH_CONFIG.protectedPaths.some(pattern => {
    if (pattern.includes('[collection]')) {
      // Handle dynamic collection routes
      const regex = pattern.replace('[collection]', '[^/]+')
      return new RegExp(`^${regex}`).test(pathname)
    }
    
    if (pattern.endsWith('/')) {
      // Handle directory patterns
      return pathname.startsWith(pattern)
    }
    
    return false
  })
}

/**
 * Check if a path is public (no authentication required)
 */
function isPublicPath(pathname: string): boolean {
  // Check exact matches first
  if (AUTH_CONFIG.publicPaths.includes(pathname)) {
    return true
  }

  // Check pattern matches
  return AUTH_CONFIG.publicPaths.some(pattern => {
    if (pattern.includes('[collection]')) {
      // Handle dynamic collection routes
      const regex = pattern.replace('[collection]', '[^/]+')
      return new RegExp(`^${regex}`).test(pathname)
    }
    
    if (pattern.endsWith('/')) {
      // Handle directory patterns
      return pathname.startsWith(pattern)
    }
    
    return false
  })
}

/**
 * Check if a path uses custom authentication
 */
function usesCustomAuth(pathname: string): boolean {
  return AUTH_CONFIG.customAuthPaths.some(pattern => {
    if (pattern.endsWith('/')) {
      return pathname.startsWith(pattern)
    }
    return pathname === pattern
  })
}

/**
 * Verify API key from request headers
 */
async function verifyApiKeyInMiddleware(request: NextRequest): Promise<{
  isValid: boolean
  authFormat: 'bearer' | 'x-api-key' | 'none'
  error?: string
}> {
  const startTime = Date.now()
  let authFormat: 'bearer' | 'x-api-key' | 'none' = 'none'
  let providedKey: string | null = null

  try {
    // Check for new format: Authorization: Bearer <token>
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authFormat = 'bearer'
      providedKey = authHeader.substring(7)
      logDebug('[authMiddleware] Using Authorization: Bearer format')
    }
    // Check for legacy format: x-api-key header
    else {
      const legacyKey = request.headers.get('x-api-key')
      if (legacyKey) {
        authFormat = 'x-api-key'
        providedKey = legacyKey
        logWarn('[authMiddleware] Using legacy x-api-key format - please migrate to Authorization: Bearer')
      }
    }

    // No authentication provided
    if (!providedKey) {
      return {
        isValid: false,
        authFormat: 'none',
        error: 'Missing API key. Use either "Authorization: Bearer <token>" or "x-api-key: <token>" header'
      }
    }

    // Validate the API key
    const isValid = providedKey === process.env.PAYLOAD_SECRET
    const responseTime = Date.now() - startTime

    if (!isValid) {
      logWarn(`[authMiddleware] Invalid API key attempt using ${authFormat} format (${responseTime}ms)`)
      return {
        isValid: false,
        authFormat,
        error: 'Invalid API key'
      }
    }

    // Log successful authentication
    logInfo(`[authMiddleware] Successful authentication using ${authFormat} format (${responseTime}ms)`)
    
    // Add usage metrics for monitoring
    if (AUTH_CONFIG.enableMetrics && typeof globalThis !== 'undefined') {
      globalThis.authMetrics = globalThis.authMetrics || { bearer: 0, 'x-api-key': 0 }
      globalThis.authMetrics[authFormat]++
    }

    return {
      isValid: true,
      authFormat
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    logError(`[authMiddleware] Authentication error (${responseTime}ms):`, error)
    return {
      isValid: false,
      authFormat: 'none',
      error: 'Failed to verify API key'
    }
  }
}

/**
 * Create authentication error response
 */
function createAuthErrorResponse(error: string, status: number = 401): NextResponse {
  return NextResponse.json(
    { error },
    { 
      status,
      headers: {
        'WWW-Authenticate': 'Bearer realm="API", charset="UTF-8"',
        'X-Auth-Error': 'true'
      }
    }
  )
}

/**
 * Main authentication middleware function
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname

  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return null
  }

  logDebug(`[authMiddleware] Processing ${request.method} ${pathname}`)

  // Check if path is public (no authentication required)
  if (isPublicPath(pathname)) {
    logDebug(`[authMiddleware] Public path, skipping authentication: ${pathname}`)
    return null
  }

  // Check if path uses custom authentication
  if (usesCustomAuth(pathname)) {
    logDebug(`[authMiddleware] Custom auth path, skipping middleware: ${pathname}`)
    return null
  }

  // Check if path requires API key authentication
  if (requiresApiKeyAuth(pathname)) {
    logDebug(`[authMiddleware] Protected path, verifying API key: ${pathname}`)
    
    const authResult = await verifyApiKeyInMiddleware(request)
    
    if (!authResult.isValid) {
      logWarn(`[authMiddleware] Authentication failed for ${pathname}: ${authResult.error}`)
      return createAuthErrorResponse(authResult.error || 'Authentication failed', 401)
    }

    // Add authentication info to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-auth-format', authResult.authFormat)
    requestHeaders.set('x-auth-verified', 'true')

    logDebug(`[authMiddleware] Authentication successful for ${pathname} using ${authResult.authFormat}`)
    
    // Continue with authenticated request
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }

  // Path doesn't match any authentication rules, continue without auth
  logDebug(`[authMiddleware] No authentication rules matched for ${pathname}`)
  return null
}

/**
 * Get authentication metrics for monitoring
 */
export function getAuthMiddlewareMetrics(): { bearer: number; 'x-api-key': number; total: number } {
  const metrics = (globalThis as any).authMetrics || { bearer: 0, 'x-api-key': 0 }
  return {
    ...metrics,
    total: metrics.bearer + metrics['x-api-key'],
  }
}

/**
 * Reset authentication metrics
 */
export function resetAuthMiddlewareMetrics(): void {
  if (typeof globalThis !== 'undefined') {
    ;(globalThis as any).authMetrics = { bearer: 0, 'x-api-key': 0 }
  }
}

/**
 * Update authentication configuration
 */
export function updateAuthConfig(newConfig: Partial<AuthConfig>): void {
  Object.assign(AUTH_CONFIG, newConfig)
  logInfo('[authMiddleware] Authentication configuration updated')
}
