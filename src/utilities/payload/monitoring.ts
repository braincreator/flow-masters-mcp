import { EventEmitter } from 'events'
import type { Payload } from 'payload'

interface ConnectionMetrics {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  errorCount: number
  lastError?: Error
  avgResponseTime: number
  queryStats: {
    totalQueries: number
    slowQueries: number // Queries taking > 1000ms
    queryTypes: Record<string, number> // Count by operation type (find, update, etc)
  }
  poolStats: {
    maxSize: number
    available: number
    pending: number
    timeouts: number
  }
}

interface ErrorDetails {
  message: string
  code: string
  timestamp: number
  context?: Record<string, unknown>
}

interface PerformanceThresholds {
  slowQueryMs: number
  highConnectionCount: number
  criticalResponseTime: number
  poolExhaustionThreshold: number
}

const defaultThresholds: PerformanceThresholds = {
  slowQueryMs: 1000,
  highConnectionCount: 10,
  criticalResponseTime: 5000,
  poolExhaustionThreshold: 2
}

class ConnectionMonitor extends EventEmitter {
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    errorCount: 0,
    avgResponseTime: 0,
    queryStats: {
      totalQueries: 0,
      slowQueries: 0,
      queryTypes: {}
    },
    poolStats: {
      maxSize: 10, // Default pool size
      available: 10,
      pending: 0,
      timeouts: 0
    }
  }
  
  private readonly maxSamples = 100
  private readonly maxErrorLog = 100
  private responseTimeSamples: number[] = []
  private errorLog: ErrorDetails[] = []
  private readonly slowQueryThreshold = 1000 // ms
  private thresholds: PerformanceThresholds

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    super()
    this.thresholds = { ...defaultThresholds, ...thresholds }
    this.startPeriodicCheck()
  }

  private startPeriodicCheck() {
    setInterval(() => {
      this.checkMetrics()
    }, 60000) // Check every minute
  }

  private checkMetrics() {
    if (this.metrics.activeConnections > this.thresholds.highConnectionCount) {
      this.emit('high-connection-count', this.metrics)
    }
    
    if (this.metrics.avgResponseTime > this.thresholds.criticalResponseTime) {
      this.emit('critical-response-time', this.metrics)
    }

    if (this.metrics.queryStats.slowQueries > 10) {
      this.emit('high-slow-query-count', this.metrics)
    }

    if (this.metrics.poolStats.available < this.thresholds.poolExhaustionThreshold) {
      this.emit('pool-exhaustion-warning', this.metrics)
    }
  }

  recordConnection() {
    this.metrics.totalConnections++
    this.metrics.activeConnections++
    this.metrics.poolStats.available--
    this.emit('connection', this.metrics)
  }

  recordDisconnection() {
    this.metrics.activeConnections--
    this.metrics.poolStats.available++
    this.emit('disconnection', this.metrics)
  }

  recordError(error: Error, context?: Record<string, unknown>) {
    const errorDetail: ErrorDetails = {
      message: error.message,
      code: error instanceof Error ? error.name : 'UnknownError',
      timestamp: Date.now(),
      context
    }
    
    this.errorLog.unshift(errorDetail)
    if (this.errorLog.length > this.maxErrorLog) {
      this.errorLog.pop()
    }
    
    this.metrics.errorCount++
    this.metrics.lastError = error
    this.emit('error', error, errorDetail)
  }

  recordQuery(operationType: string, duration: number) {
    this.metrics.queryStats.totalQueries++
    this.metrics.queryStats.queryTypes[operationType] = 
      (this.metrics.queryStats.queryTypes[operationType] || 0) + 1

    if (duration > this.slowQueryThreshold) {
      this.metrics.queryStats.slowQueries++
      this.emit('slow-query', { operationType, duration })
    }

    this.recordResponseTime(duration)
  }

  recordResponseTime(time: number) {
    this.responseTimeSamples.push(time)
    while (this.responseTimeSamples.length > this.maxSamples) {
      this.responseTimeSamples.shift()
    }
    
    this.metrics.avgResponseTime = 
      this.responseTimeSamples.reduce((a, b) => a + b, 0) / 
      this.responseTimeSamples.length
  }

  recordPoolTimeout() {
    this.metrics.poolStats.timeouts++
    this.emit('pool-timeout', this.metrics)
  }

  updatePoolStats(available: number, pending: number) {
    this.metrics.poolStats.available = available
    this.metrics.poolStats.pending = pending
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics }
  }

  resetMetrics() {
    this.metrics.queryStats.totalQueries = 0
    this.metrics.queryStats.slowQueries = 0
    this.metrics.queryStats.queryTypes = {}
    this.responseTimeSamples = []
  }

  getErrorLog(): ErrorDetails[] {
    return [...this.errorLog]
  }

  cleanup() {
    this.responseTimeSamples = []
    this.errorLog = []
    this.removeAllListeners()
  }

  async validateConnection(connection: Connection): Promise<boolean> {
    try {
      const startTime = Date.now()
      await connection.db.admin().ping()
      this.recordResponseTime(Date.now() - startTime)
      return true
    } catch (error) {
      this.recordError(error as Error, { context: 'connection-validation' })
      return false
    }
  }

  async checkPoolHealth(): Promise<{
    healthy: boolean;
    diagnostics: Record<string, unknown>;
  }> {
    const metrics = this.getMetrics()
    const poolUtilization = (
      (metrics.poolStats.maxSize - metrics.poolStats.available) / 
      metrics.poolStats.maxSize
    )

    const diagnostics = {
      poolUtilization: poolUtilization * 100,
      errorRate: metrics.errorCount / metrics.queryStats.totalQueries,
      avgResponseTime: metrics.avgResponseTime,
      activeConnections: metrics.activeConnections,
      slowQueriesRate: metrics.queryStats.slowQueries / metrics.queryStats.totalQueries
    }

    const healthy = 
      poolUtilization < 0.9 && // Less than 90% pool utilization
      diagnostics.errorRate < 0.05 && // Less than 5% error rate
      metrics.avgResponseTime < 1000 && // Less than 1s average response
      diagnostics.slowQueriesRate < 0.1 // Less than 10% slow queries

    return { healthy, diagnostics }
  }

  getDetailedMetrics(): Record<string, unknown> {
    const baseMetrics = this.getMetrics()
    const timeWindow = 5 * 60 * 1000 // 5 minutes
    const recentErrors = this.errorLog.filter(
      error => Date.now() - error.timestamp < timeWindow
    )

    return {
      ...baseMetrics,
      health: {
        recentErrors: recentErrors.length,
        errorRate: recentErrors.length / (baseMetrics.queryStats.totalQueries || 1),
        poolUtilization: (
          (baseMetrics.poolStats.maxSize - baseMetrics.poolStats.available) / 
          baseMetrics.poolStats.maxSize * 100
        ).toFixed(2) + '%',
        status: this.determineHealthStatus(baseMetrics)
      },
      performance: {
        queryThroughput: baseMetrics.queryStats.totalQueries / (timeWindow / 1000),
        averageLatency: baseMetrics.avgResponseTime,
        slowQueriesPercentage: (
          baseMetrics.queryStats.slowQueries / 
          (baseMetrics.queryStats.totalQueries || 1) * 100
        ).toFixed(2) + '%'
      }
    }
  }

  private determineHealthStatus(metrics: ConnectionMetrics): 'healthy' | 'degraded' | 'critical' {
    if (
      metrics.errorCount > 100 || 
      metrics.avgResponseTime > 5000 || 
      metrics.poolStats.available === 0
    ) {
      return 'critical'
    }
    
    if (
      metrics.errorCount > 50 || 
      metrics.avgResponseTime > 2000 || 
      metrics.poolStats.available < 3
    ) {
      return 'degraded'
    }
    
    return 'healthy'
  }
}

export const connectionMonitor = new ConnectionMonitor()

// Enhanced middleware to monitor database operations with more detail
export const monitorDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  payload: Payload,
  operationType: string
): Promise<T> => {
  const startTime = Date.now()
  
  try {
    const result = await operation()
    const duration = Date.now() - startTime
    
    connectionMonitor.recordQuery(operationType, duration)
    
    return result
  } catch (error) {
    connectionMonitor.recordError(error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}
