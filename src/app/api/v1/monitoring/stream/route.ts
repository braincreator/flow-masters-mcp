import { NextRequest } from 'next/server'
import { connectionMonitor } from '@/utilities/payload/monitoring'
import { metricsCollector } from '@/utilities/payload/metrics'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  let lastCpuUsage = process.cpuUsage()
  let lastCpuTime = Date.now()

  const calculateCpuUsage = () => {
    const currentCpuUsage = process.cpuUsage()
    const currentTime = Date.now()
    const timeDiff = currentTime - lastCpuTime

    // Calculate CPU usage percentage
    const userDiff = currentCpuUsage.user - lastCpuUsage.user
    const systemDiff = currentCpuUsage.system - lastCpuUsage.system
    const totalCpuTime = userDiff + systemDiff

    // Convert to percentage (microseconds to milliseconds, then to percentage)
    const cpuPercent = Math.min(100, (totalCpuTime / 1000 / timeDiff) * 100)

    // Update last values for next calculation
    lastCpuUsage = currentCpuUsage
    lastCpuTime = currentTime

    return Math.round(cpuPercent)
  }

  const calculateMemoryUsage = () => {
    const memory = process.memoryUsage()
    return {
      heapUsed: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
      rss: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      percentage: Math.round((memory.heapUsed / memory.heapTotal) * 100),
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false

      const sendMetrics = async () => {
        if (isClosed) return

        try {
          const memoryMetrics = calculateMemoryUsage()
          const cpuUsage = calculateCpuUsage()

          const metrics = {
            connections: connectionMonitor.getMetrics(),
            system: {
              cpu: {
                usage: cpuUsage,
              },
              memory: {
                used: memoryMetrics.heapUsed,
                total: memoryMetrics.heapTotal,
                rss: memoryMetrics.rss,
                percentage: memoryMetrics.percentage,
              },
            },
            application: metricsCollector.getMetrics().application,
            timestamp: new Date().toISOString(),
          }

          if (!isClosed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(metrics)}\n\n`))
          }
        } catch (error) {
          logError('Error calculating metrics:', error)
          if (!isClosed) {
            try {
              controller.error(error)
            } catch (e) {
              // Controller might already be closed
            }
          }
        }
      }

      // Send initial metrics immediately
      await sendMetrics()

      // Set up interval for subsequent metrics
      const interval = setInterval(sendMetrics, 2000) // Increased frequency to 2 seconds

      // Clean up on connection close
      const cleanup = () => {
        isClosed = true
        clearInterval(interval)
        try {
          controller.close()
        } catch (e) {
          // Controller might already be closed
        }
      }

      request.signal.addEventListener('abort', cleanup)

      // Also handle manual cleanup
      return cleanup
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
