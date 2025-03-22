import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

export async function GET() {
  const metrics = connectionMonitor.getMetrics()
  const systemMetrics = await getSystemMetrics()
  
  const health = {
    status: determineHealthStatus(metrics),
    database: {
      status: metrics.errorCount > 100 ? 'degraded' : 'healthy',
      connections: {
        active: metrics.activeConnections,
        idle: metrics.idleConnections,
        total: metrics.totalConnections
      },
      poolUtilization: calculatePoolUtilization(metrics),
      recentErrors: connectionMonitor.getErrorLog().slice(0, 5)
    },
    performance: {
      avgResponseTime: metrics.avgResponseTime,
      slowQueries: metrics.queryStats.slowQueries,
      queryTypes: metrics.queryStats.queryTypes
    },
    system: {
      memory: formatMemoryUsage(systemMetrics.memory),
      cpu: systemMetrics.cpu,
      uptime: formatUptime(systemMetrics.uptime)
    },
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(health)
}

function determineHealthStatus(metrics: ConnectionMetrics): 'healthy' | 'degraded' | 'critical' {
  if (metrics.errorCount > 100 || metrics.avgResponseTime > 5000) {
    return 'critical'
  }
  if (metrics.errorCount > 50 || metrics.avgResponseTime > 1000) {
    return 'degraded'
  }
  return 'healthy'
}
