import { NextRequest } from 'next/server'
import { createCorsResponse, createCorsPreflightResponse } from '@/utilities/cors'

// Simple health check endpoint for Docker health checks
// This is a lightweight endpoint that doesn't perform heavy database checks
export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get('origin')
    
    return createCorsResponse(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200, origin }
    )
  } catch (error) {
    const origin = request.headers.get('origin')
    
    return createCorsResponse(
      {
        status: 'unhealthy',
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500, origin }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return createCorsPreflightResponse(origin)
}