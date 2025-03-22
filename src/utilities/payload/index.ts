import { getPayload } from 'payload'
import type { Payload } from 'payload'
import configPromise from '@payload-config'
import { connectionMonitor } from './monitoring'

// Preserve existing pool config
const POOL_CONFIG = {
  MAX_CONNECTIONS: 5, // Reduced from 10
  MIN_CONNECTIONS: 1,
  IDLE_TIMEOUT: 3 * 60 * 1000, // Reduced to 3 minutes
  ACQUIRE_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  CLEANUP_INTERVAL: 60000 // 1 minute
} as const

class PayloadConnectionPool {
  private static instance: PayloadConnectionPool
  private connectionPool: Map<string, Payload> = new Map()
  private connectionMetadata: Map<Payload, {
    lastUsed: number
    isAcquiring: boolean
    retryCount: number
    timeoutId?: NodeJS.Timeout
  }> = new Map()

  private maintenanceInterval?: NodeJS.Timeout
  private cleanupInterval?: NodeJS.Timeout

  private constructor() {
    this.startMaintenanceRoutine()
    this.startCleanupRoutine()
  }

  private startMaintenanceRoutine() {
    // Clear old interval if exists
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval)
    }
    
    this.maintenanceInterval = setInterval(() => {
      this.performMaintenance().catch(console.error)
    }, POOL_CONFIG.CLEANUP_INTERVAL)
  }

  private startCleanupRoutine() {
    // Clear old interval if exists
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [payload, metadata] of this.connectionMetadata.entries()) {
        if (now - metadata.lastUsed > POOL_CONFIG.IDLE_TIMEOUT) {
          this.releaseConnection(payload).catch(console.error)
        }
      }
    }, POOL_CONFIG.CLEANUP_INTERVAL)
  }

  public async shutdown() {
    if (this.maintenanceInterval) clearInterval(this.maintenanceInterval)
    if (this.cleanupInterval) clearInterval(this.cleanupInterval)
    await this.releaseAll()
    this.connectionPool.clear()
    this.connectionMetadata.clear()
  }

  public static getInstance(): PayloadConnectionPool {
    if (!PayloadConnectionPool.instance) {
      PayloadConnectionPool.instance = new PayloadConnectionPool()
    }
    return PayloadConnectionPool.instance
  }

  private async createConnection(key: string): Promise<Payload> {
    const config = await configPromise
    
    const payload = await getPayload({
      config,
      // Preserve existing options, just update critical ones
      options: {
        ...config.options,
        mongoOptions: {
          ...config.options?.mongoOptions,
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        }
      }
    })

    this.connectionPool.set(key, payload)
    this.connectionMetadata.set(payload, {
      lastUsed: Date.now(),
      isAcquiring: false,
      retryCount: 0
    })

    connectionMonitor.recordConnection()
    return payload
  }

  private async releaseConnection(payload: Payload): Promise<void> {
    try {
      // Fix: Use mongoose connection close instead of disconnect
      if (payload.db?.mongoose?.connection?.readyState === 1) {
        await payload.db.mongoose.connection.close()
      }
      
      const key = Array.from(this.connectionPool.entries())
        .find(([_, p]) => p === payload)?.[0]
      
      if (key) {
        this.connectionPool.delete(key)
      }
      this.connectionMetadata.delete(payload)
      
      connectionMonitor.recordDisconnection()
    } catch (error) {
      console.error('Error releasing connection:', error)
      connectionMonitor.recordError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private async performMaintenance(): Promise<void> {
    const now = Date.now()
    
    for (const [client, metadata] of this.connectionMetadata.entries()) {
      if (!metadata.isAcquiring && 
          (now - metadata.lastUsed > POOL_CONFIG.IDLE_TIMEOUT) && 
          this.connectionPool.size > POOL_CONFIG.MIN_CONNECTIONS) {
        await this.releaseConnection(client)
      }
    }
  }

  public async acquireConnection(key: string = 'default'): Promise<Payload> {
    const existingPayload = this.connectionPool.get(key)
    
    if (existingPayload) {
      const metadata = this.connectionMetadata.get(existingPayload)
      if (metadata) {
        metadata.lastUsed = Date.now()
        // Check if connection is still alive
        if (existingPayload.db?.mongoose?.connection?.readyState === 1) {
          return existingPayload
        }
      }
    }

    return this.createConnection(key)
  }

  public async releaseAll(): Promise<void> {
    const promises = Array.from(this.connectionPool.values()).map(payload => 
      this.releaseConnection(payload)
    )
    await Promise.all(promises)
  }
}

// Preserve existing exports and singleton
const connectionPool = PayloadConnectionPool.getInstance()

export async function getPayloadClient(key?: string): Promise<Payload> {
  return connectionPool.acquireConnection(key)
}

export async function cleanupPayloadConnections(): Promise<void> {
  await connectionPool.releaseAll()
}

// Preserve existing process handlers
process.once('SIGTERM', () => {
  cleanupPayloadConnections().catch(console.error)
})

process.once('SIGINT', () => {
  cleanupPayloadConnections().catch(console.error)
})
