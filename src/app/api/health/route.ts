import { NextResponse } from 'next/server'

// Simple health check endpoint for Docker health checks
// This is a lightweight endpoint that doesn't perform heavy database checks
export async function GET() {
  try {
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}