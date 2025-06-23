'use client'

import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
// Temporarily remove specific Payload types for props
// import { AdminViewComponent, AdminViewProps } from 'payload/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const THRESHOLDS = {
  warning: {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    poolUtilization: 0.7, // 70%
    cpuUsage: 70, // 70%
    memoryUsage: 80, // 80%
  },
  critical: {
    responseTime: 5000, // 5 seconds
    errorRate: 0.1, // 10%
    poolUtilization: 0.9, // 90%
    cpuUsage: 90, // 90%
    memoryUsage: 90, // 90%
  },
} as const

interface MetricsData {
  connections: {
    activeConnections: number
    queryStats: {
      totalQueries: number
      slowQueries: number
    }
    poolStats: {
      available: number
      pending: number
    }
    avgResponseTime: number
  }
  system: {
    cpu: {
      usage: number
    }
    memory: {
      percentage: number
      used: number
      total: number
    }
  }
  application: {
    requestCount: number
    errorCount: number
  }
  timestamp: string
}

interface MetricCardProps {
  title: string
  value: number | string
  thresholds?: { warning: number; critical: number }
  trend?: { direction: 'up' | 'down'; percentage: number }
}

// Use proper types for Payload v3
const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const eventSource = new EventSource('/api/monitoring/stream')

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const newMetrics = JSON.parse(event.data)
        setMetrics((current) => {
          const updated = [...current, newMetrics].slice(-30) // Keep last 30 data points
          return updated
        })
      } catch (error) {
        logError('Error parsing metrics:', error)
      }
    }

    eventSource.onerror = (error) => {
      logError('EventSource error:', error)
      setIsConnected(false)
      setError('Connection lost. Attempting to reconnect...')
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [])

  const latestMetrics = metrics[metrics.length - 1]

  const chartData = {
    labels: metrics.map((m) => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: metrics.map((m) => m.system.cpu.usage),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Memory Usage (%)',
        data: metrics.map((m) => m.system.memory.percentage),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Active Connections',
        data: metrics.map((m) => m.connections.activeConnections),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable animations for better performance
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'System Metrics (Real-time)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Set max to 100 for percentage metrics
      },
    },
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-red-100'
    if (value >= thresholds.warning) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  return (
    <div className="payload-template">
      <div className="gutter--left gutter--right">
        <div className="dashboard">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="style-h1">System Metrics</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="CPU Usage"
              value={`${Math.round(latestMetrics?.system?.cpu?.usage || 0)}%`}
              thresholds={{
                warning: THRESHOLDS.warning.cpuUsage,
                critical: THRESHOLDS.critical.cpuUsage,
              }}
            />
            <MetricCard
              title="Memory Usage"
              value={`${Math.round(latestMetrics?.system?.memory?.percentage || 0)}%`}
              thresholds={{
                warning: THRESHOLDS.warning.memoryUsage,
                critical: THRESHOLDS.critical.memoryUsage,
              }}
            />
            <MetricCard
              title="Active Connections"
              value={latestMetrics?.connections?.activeConnections || 0}
              thresholds={{
                warning: THRESHOLDS.warning.poolUtilization * 10,
                critical: THRESHOLDS.critical.poolUtilization * 10,
              }}
            />
            <MetricCard
              title="Memory Used"
              value={`${latestMetrics?.system?.memory?.used || 0} MB`}
              subtitle={`Total: ${latestMetrics?.system?.memory?.total || 0} MB`}
            />
          </div>

          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, thresholds, trend }: MetricCardProps) {
  const getStatusColor = () => {
    if (!thresholds || typeof value !== 'number') return 'bg-gray-100'
    if (value >= thresholds.critical) return 'bg-red-100'
    if (value >= thresholds.warning) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  return (
    <div className={`p-4 rounded-lg ${getStatusColor()}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-1 flex items-baseline justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend.direction === 'up' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricsDashboard
