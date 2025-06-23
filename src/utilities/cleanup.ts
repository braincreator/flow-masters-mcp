import { cleanupGlobalCache } from './getGlobals'
import { cleanupLocaleCache } from './localization'
import { cleanupPayloadConnections } from './payload'
import { connectionMonitor } from './payload/monitoring'
import { databaseConnection } from './payload/database/connection'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function cleanupResources() {
  // Clear all intervals and timeouts
  const globalThis = (typeof window !== 'undefined' ? window : global) as any
  const timers = globalThis?.[Symbol.for('nodejs.timer_handles')]
  if (timers?.forEach) {
    timers.forEach((timer: any) => {
      if (timer?._onTimeout) {
        clearTimeout(timer)
      }
    })
  }

  // Cleanup all caches
  cleanupGlobalCache()
  cleanupLocaleCache()

  // Cleanup connections
  await cleanupPayloadConnections()

  // Cleanup monitoring
  connectionMonitor.cleanup()

  // Cleanup database
  if (typeof databaseConnection.disconnect === 'function') {
    await databaseConnection.disconnect()
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
}

// Register cleanup handlers
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    cleanupResources().catch(console.error)
  })

  process.on('SIGINT', () => {
    cleanupResources().catch(console.error)
  })

  // Cleanup before exit
  process.on('beforeExit', () => {
    cleanupResources().catch(console.error)
  })
}
