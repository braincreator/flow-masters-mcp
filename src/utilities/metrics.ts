export class MetricsCollector {
  private requestCount = 0
  private errorCount = 0
  private durations: number[] = []

  recordRequest() {
    this.requestCount++
  }

  recordError(error: Error) {
    this.errorCount++
    logError('Middleware error:', error)
  }

  recordOperationDuration(duration: number) {
    this.durations.push(duration)
    if (this.durations.length > 100) this.durations.shift()
  }
}

export const metricsCollector = new MetricsCollector()