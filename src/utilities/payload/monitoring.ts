import { EventEmitter } from 'events'
import type { Payload } from 'payload'
import type { Connection } from 'mongoose'
import { logger } from '../logger'

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
  poolExhaustionThreshold: 2,
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
      queryTypes: {},
    },
    poolStats: {
      maxSize: 10, // Default pool size
      available: 10,
      pending: 0,
      timeouts: 0,
    },
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
    // Отключаем автоматическую проверку в разработке
    if (process.env.NODE_ENV !== 'development') {
      this.startPeriodicCheck()
    }
  }

  private startPeriodicCheck() {
    setInterval(() => {
      this.checkMetrics()
    }, 60000) // Check every minute
  }

  private checkMetrics() {
    try {
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
    } catch (error) {
      logger.error('Error in connection monitor metrics check:', error)
    }
  }

  recordConnection() {
    this.metrics.totalConnections++
    this.metrics.activeConnections++
    this.metrics.poolStats.available = Math.max(0, this.metrics.poolStats.available - 1)
    this.emit('connection', this.metrics)
  }

  recordDisconnection() {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1)
    this.metrics.poolStats.available++
    this.emit('disconnection', this.metrics)
  }

  recordError(error: Error, context?: Record<string, unknown>) {
    try {
      const errorDetail: ErrorDetails = {
        message: error.message,
        code: error instanceof Error ? error.name : 'UnknownError',
        timestamp: Date.now(),
        context,
      }

      this.errorLog.unshift(errorDetail)
      if (this.errorLog.length > this.maxErrorLog) {
        this.errorLog.pop()
      }

      this.metrics.errorCount++
      this.metrics.lastError = error
      this.emit('error', error, errorDetail)
    } catch (err) {
      // Ничего не делаем, просто предотвращаем падение
      logger.error('Error in recordError:', err)
    }
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
      Math.max(1, this.responseTimeSamples.length)
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
      // Проверяем, что соединение существует
      if (!connection || !connection.db) {
        return false
      }

      const startTime = Date.now()
      await connection.db.admin().ping()
      this.recordResponseTime(Date.now() - startTime)
      return true
    } catch (error) {
      this.recordError(error instanceof Error ? error : new Error(String(error)), {
        context: 'connection-validation',
      })
      return false
    }
  }

  private determineHealthStatus(metrics: ConnectionMetrics): 'healthy' | 'degraded' | 'critical' {
    if (
      metrics.avgResponseTime > this.thresholds.criticalResponseTime ||
      metrics.errorCount > 100 ||
      metrics.poolStats.available === 0
    ) {
      return 'critical'
    } else if (
      metrics.avgResponseTime > this.thresholds.slowQueryMs ||
      metrics.errorCount > 10 ||
      metrics.poolStats.available <= this.thresholds.poolExhaustionThreshold
    ) {
      return 'degraded'
    }
    return 'healthy'
  }
}

export const connectionMonitor = new ConnectionMonitor()

export const monitorDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  operationType: string,
): Promise<T> => {
  const startTime = Date.now()
  try {
    const result = await operation()
    connectionMonitor.recordQuery(operationType, Date.now() - startTime)
    return result
  } catch (error) {
    connectionMonitor.recordError(error instanceof Error ? error : new Error(String(error)), {
      operationType,
    })
    throw error
  }
}
