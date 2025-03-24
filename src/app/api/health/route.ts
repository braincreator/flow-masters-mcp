import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { connectionMonitor } from '@/utilities/payload/monitoring'
import { metricsCollector } from '@/utilities/payload/metrics'

export async function GET() {
  const metrics = connectionMonitor.getDetailedMetrics()
  const { system, application } = metricsCollector.getMetrics()
  
  const health = {
    status: determineHealthStatus(metrics),
    database: {
      status: metrics.health.status,
      connections: {
        active: metrics.activeConnections,
        idle: metrics.idleConnections,
        total: metrics.totalConnections
      },
      performance: metrics.performance,
      poolUtilization: metrics.health.poolUtilization
    },
    system: {
      heapUsed: system.heapUsed,
      heapTotal: system.heapTotal,
      rss: system.rss,
      uptime: system.uptime,
      cpu: system.cpu
    },
    application: {
      requestCount: application.requestCount,
      errorCount: application.errorCount,
      slowOperations: application.slowOperations,
      lastError: application.lastError
    },
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(health)
}

function determineHealthStatus(metrics: any): 'healthy' | 'degraded' | 'critical' {
  if (metrics.health.status === 'critical') {
    return 'critical'
  }
  if (metrics.health.status === 'degraded') {
    return 'degraded'
  }
  return 'healthy'
}
