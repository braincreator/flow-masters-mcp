import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import mongoose from 'mongoose'
import { databaseConnection } from '@/utilities/payload/database/connection'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const healthCheck = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      status: 'ok',
      connectionState: databaseConnection.getConnectionStatus(),
      responseTime: 0,
      memoryUsage: process.memoryUsage(),
      poolStats: {
        active: mongoose.connection.client?.topology?.s?.pool?.totalConnectionCount || 0,
        available: mongoose.connection.client?.topology?.s?.pool?.availableConnectionCount || 0,
        pending: mongoose.connection.client?.topology?.s?.pool?.pendingConnectionCount || 0,
      }
    }

    const start = Date.now()
    await payload.db.connection.db.admin().ping()
    healthCheck.responseTime = Date.now() - start

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Database health check failed',
        timestamp: Date.now()
      },
      { status: 503 }
    )
  }
}
