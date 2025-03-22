import { EventEmitter } from 'events'

export interface ConnectionMetrics {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  errorCount: number
  lastError?: Error
  avgResponseTime: number
  queryStats: {
    totalQueries: number
    slowQueries: number
    queryTypes: Record<string, number>
  }
  poolStats: {
    maxSize: number
    available: number
    pending: number
    timeouts: number
  }
}

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
  uptime: number
  loadAverage: number[]
}

export interface ApplicationMetrics {
  requestCount: number
  errorCount: number
  activeUsers: number
  cacheHitRate: number
  averageResponseTime: number
}

export interface MetricsSnapshot {
  connections: ConnectionMetrics
  system: SystemMetrics
  application: ApplicationMetrics
  timestamp: string
}

export interface MonitoringEvents {
  'connection': () => void
  'disconnection': () => void
  'error': (error: Error) => void
  'slow-query': (queryTime: number) => void
  'pool-timeout': () => void
  'high-connection-count': (count: number) => void
}

export interface MetricsCollector {
  getMetrics(): MetricsSnapshot
  recordQuery(duration: number): void
  recordRequest(duration: number, isError?: boolean): void
  recordCacheHit(hit: boolean): void
  updateActiveUsers(count: number): void
}

export interface ConnectionMonitor extends EventEmitter {
  getMetrics(): ConnectionMetrics
  recordConnection(): void
  recordDisconnection(): void
  recordError(error: Error): void
  recordQuery(operationType: string, duration: number): void
  recordResponseTime(time: number): void
  recordPoolTimeout(): void
  updatePoolStats(available: number, pending: number): void
  resetMetrics(): void
  emit(event: 'error', error: Error): boolean
  emit(event: 'connection' | 'disconnection' | 'pool-timeout'): boolean
  emit(event: 'slow-query', data: { operationType: string; duration: number }): boolean
  emit(event: 'high-connection-count' | 'high-response-time' | 'high-slow-query-count' | 'pool-exhaustion-warning', metrics: ConnectionMetrics): boolean
}
