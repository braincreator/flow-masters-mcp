import { getPayloadClient } from './index'
import { withTransaction } from './transactions'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface CleanupOptions {
  olderThan?: Date
  collections?: string[]
  batchSize?: number
}

export async function cleanupStaleData({
  olderThan = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
  collections = ['search', 'media'],
  batchSize = 1000,
}: CleanupOptions = {}) {
  const payload = await getPayloadClient()

  try {
    await withTransaction(
      async (session) => {
        for (const collection of collections) {
          const query = {
            updatedAt: { $lt: olderThan },
            // Add additional conditions as needed
          }

          const count = await payload.db.connection.collection(collection).countDocuments(query)

          logDebug(`Found ${count} stale documents in ${collection}`)

          for (let i = 0; i < count; i += batchSize) {
            await payload.db.connection.collection(collection).deleteMany(query, {
              session,
              limit: batchSize,
            })

            logDebug(`Deleted batch ${i / batchSize + 1} from ${collection}`)
          }
        }
      },
      { timeout: 60000 },
    ) // 1 minute timeout

    logDebug('Cleanup completed successfully')
  } catch (error) {
    logError('Error during cleanup:', error)
    throw error
  }
}

// Schedule regular cleanup
if (process.env.NODE_ENV === 'production') {
  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours

  setInterval(async () => {
    try {
      await cleanupStaleData()
    } catch (error) {
      logError('Scheduled cleanup failed:', error)
    }
  }, CLEANUP_INTERVAL)
}
