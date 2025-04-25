import { getPayloadClient } from './index'
import { withTransaction } from './transactions'

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

          console.log(`Found ${count} stale documents in ${collection}`)

          for (let i = 0; i < count; i += batchSize) {
            await payload.db.connection.collection(collection).deleteMany(query, {
              session,
              limit: batchSize,
            })

            console.log(`Deleted batch ${i / batchSize + 1} from ${collection}`)
          }
        }
      },
      { timeout: 60000 },
    ) // 1 minute timeout

    console.log('Cleanup completed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
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
      console.error('Scheduled cleanup failed:', error)
    }
  }, CLEANUP_INTERVAL)
}
