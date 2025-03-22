import { EventEmitter } from 'events'

export interface SystemMetrics {
  heapUsed: number
  heapTotal: number
  rss: number
  uptime: number
  cpu: NodeJS.CpuUsage
}

export interface ApplicationMetrics {
  requestCount: number
  errorCount: number
  lastError?: {
    message: string
    timestamp: number
  }
  slowOperations: number // Operations taking > 1000ms
}

class MetricsCollector extends EventEmitter {
  private applicationMetrics: ApplicationMetrics = {
    requestCount: 0,
    errorCount: 0,
    slowOperations: 0
  }

  constructor() {
    super()
    this.startPeriodicCollection()
  }

  private startPeriodicCollection() {
    setInterval(() => {
      const metrics = this.collectSystemMetrics()
      this.emit('metrics', metrics)
    }, 60000) // Collect every minute
  }

  private collectSystemMetrics(): SystemMetrics {
    const memory = process.memoryUsage()
    return {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      rss: Math.round(memory.rss / 1024 / 1024),
      uptime: Math.round(process.uptime()),
      cpu: process.cpuUsage()
    }
  }

  recordRequest() {
    this.applicationMetrics.requestCount++
  }

  recordError(error: Error) {
    this.applicationMetrics.errorCount++
    this.applicationMetrics.lastError = {
      message: error.message,
      timestamp: Date.now()
    }
    this.emit('error', error)
  }

  recordOperationDuration(duration: number) {
    if (duration > 1000) {
      this.applicationMetrics.slowOperations++
      this.emit('slow-operation', { duration })
    }
  }

  getMetrics() {
    return {
      system: this.collectSystemMetrics(),
      application: { ...this.applicationMetrics }
    }
  }

  resetMetrics() {
    this.applicationMetrics = {
      requestCount: 0,
      errorCount: 0,
      slowOperations: 0
    }
  }
}

export const metricsCollector = new MetricsCollector()