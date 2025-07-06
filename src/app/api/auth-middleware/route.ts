import { NextRequest, NextResponse } from 'next/server'
import { getAuthMiddlewareMetrics, resetAuthMiddlewareMetrics } from '@/middleware/auth'
import { verifyApiKey } from '@/utilities/auth'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

/**
 * API endpoint for authentication middleware management and monitoring
 */

export async function GET(request: NextRequest) {
  try {
    // Verify API key for accessing middleware metrics
    const authResult = await verifyApiKey(request)
    if (authResult) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'metrics'

    switch (action) {
      case 'metrics': {
        const metrics = getAuthMiddlewareMetrics()
        
        return NextResponse.json({
          success: true,
          middleware: {
            name: 'Authentication Middleware',
            version: '1.0.0',
            status: 'active'
          },
          metrics: {
            bearer_requests: metrics.bearer,
            legacy_requests: metrics['x-api-key'],
            total_requests: metrics.total,
            bearer_percentage: metrics.total > 0 ? Math.round((metrics.bearer / metrics.total) * 100) : 0,
            legacy_percentage: metrics.total > 0 ? Math.round((metrics['x-api-key'] / metrics.total) * 100) : 0
          },
          recommendations: {
            migration_status: metrics['x-api-key'] > 0 ? 'in_progress' : 'completed',
            legacy_usage: metrics['x-api-key'],
            suggestion: metrics['x-api-key'] > 0 
              ? 'Consider migrating remaining integrations to Authorization: Bearer format'
              : 'All integrations are using the modern authentication format'
          },
          timestamp: new Date().toISOString()
        })
      }

      case 'health': {
        // Check middleware health
        const isHealthy = process.env.PAYLOAD_SECRET ? true : false
        
        return NextResponse.json({
          success: true,
          middleware: {
            name: 'Authentication Middleware',
            status: isHealthy ? 'healthy' : 'unhealthy',
            issues: isHealthy ? [] : ['PAYLOAD_SECRET not configured']
          },
          configuration: {
            api_key_configured: !!process.env.PAYLOAD_SECRET,
            metrics_enabled: true,
            supported_formats: ['Authorization: Bearer', 'x-api-key (deprecated)']
          },
          timestamp: new Date().toISOString()
        })
      }

      case 'config': {
        // Return middleware configuration (without sensitive data)
        return NextResponse.json({
          success: true,
          configuration: {
            protected_paths: [
              '/api/integrations',
              '/api/debug/*',
              '/api/[collection]',
              '/api/[collection]/*'
            ],
            public_paths: [
              '/api/health',
              '/api/monitoring',
              '/api/globals/*',
              '/api/send-email',
              '/api/[collection]/search',
              '/api/payment/*',
              '/api/webhooks/*'
            ],
            custom_auth_paths: [
              '/api/revalidate',
              '/api/cron/*'
            ],
            features: {
              dual_format_support: true,
              metrics_collection: true,
              deprecation_warnings: true,
              performance_tracking: true
            }
          },
          timestamp: new Date().toISOString()
        })
      }

      default: {
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          available_actions: ['metrics', 'health', 'config']
        }, { status: 400 })
      }
    }
  } catch (error) {
    logError('Auth middleware API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key for middleware management operations
    const authResult = await verifyApiKey(request)
    if (authResult) {
      return authResult
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'reset_metrics': {
        resetAuthMiddlewareMetrics()
        
        logInfo('[authMiddleware] Metrics reset via API')
        
        return NextResponse.json({
          success: true,
          message: 'Authentication middleware metrics reset successfully',
          timestamp: new Date().toISOString()
        })
      }

      case 'test_auth': {
        // Test authentication with provided credentials
        const { test_key, format } = body
        
        if (!test_key) {
          return NextResponse.json({
            success: false,
            error: 'test_key is required for authentication testing'
          }, { status: 400 })
        }

        const isValid = test_key === process.env.PAYLOAD_SECRET
        
        return NextResponse.json({
          success: true,
          test_result: {
            key_valid: isValid,
            format_used: format || 'bearer',
            message: isValid ? 'Authentication test successful' : 'Authentication test failed - invalid key'
          },
          timestamp: new Date().toISOString()
        })
      }

      default: {
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          available_actions: ['reset_metrics', 'test_auth']
        }, { status: 400 })
      }
    }
  } catch (error) {
    logError('Auth middleware API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
