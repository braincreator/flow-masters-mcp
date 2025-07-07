import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey, getAuthMetrics, resetAuthMetrics } from '@/utilities/auth'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

/**
 * Test endpoint for enhanced authentication system
 * Tests both Authorization: Bearer and x-api-key formats
 */
export async function GET(request: NextRequest) {
  try {
    // Test the enhanced authentication
    const authResult = await verifyApiKey(request)
    
    if (authResult) {
      // Authentication failed
      return authResult
    }

    // Get current authentication metrics
    const metrics = getAuthMetrics()

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      metrics: {
        bearer_usage: metrics.bearer,
        legacy_usage: metrics['x-api-key'],
        total_requests: metrics.total
      },
      timestamp: new Date().toISOString(),
      headers_received: {
        authorization: request.headers.get('Authorization') ? 'present' : 'missing',
        x_api_key: request.headers.get('x-api-key') ? 'present' : 'missing'
      }
    })
  } catch (error) {
    logError('Enhanced auth test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint to reset authentication metrics (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication first
    const authResult = await verifyApiKey(request)
    
    if (authResult) {
      return authResult
    }

    // Reset metrics
    resetAuthMetrics()

    return NextResponse.json({
      success: true,
      message: 'Authentication metrics reset successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logError('Enhanced auth metrics reset error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS endpoint for CORS support
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  })
}
