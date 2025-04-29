import { NextResponse } from 'next/server'
import { connectionMonitor } from '@/utilities/payload/monitoring'
import { metricsCollector } from '@/utilities/payload/metrics'
import { headers } from 'next/headers'
import { getPayloadClient } from '@/utilities/payload/index'

export async function GET() {
  try {
    const detailedMetrics = connectionMonitor.getDetailedMetrics()
    const { system, application } = metricsCollector.getMetrics()

    return NextResponse.json({
      connections: detailedMetrics,
      system,
      application,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function HEAD() {
  const healthCheck = await connectionMonitor.checkPoolHealth()
  const status = healthCheck.healthy ? 200 : 503

  return new NextResponse(null, {
    status,
    headers: {
      'X-Health-Details': JSON.stringify(healthCheck.diagnostics),
    },
  })
}
