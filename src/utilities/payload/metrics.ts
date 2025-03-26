import { EventEmitter } from 'events'

export interface SystemMetrics {
  timestamp: number
  requestCount: number
  errorCount: number
  averageResponseTime: number
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

export class MetricsCollector {
  private requestCount: number = 0
  private errorCount: number = 0
  private responseTimes: number[] = []

  recordRequest() {
    this.requestCount++
  }

  recordError(error: Error) {
    this.errorCount++
    console.error('Error:', error)
  }

  recordOperationDuration(duration: number) {
    this.responseTimes.push(duration)
    // Keep only last 1000 response times to manage memory
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift()
    }
  }

  getMetrics(): SystemMetrics {
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0

    return {
      timestamp: Date.now(),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime)
    }
  }
}

export const metricsCollector = new MetricsCollector()