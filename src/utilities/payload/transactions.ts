import { getPayloadClient } from './payload'
import mongoose from 'mongoose'

interface TransactionOptions {
  timeout?: number
  maxRetries?: number
}

export async function withTransaction<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>,
  options: TransactionOptions = {}
) {
  const payload = await getPayloadClient()
  const { timeout = 30000, maxRetries = 3 } = options
  let attempt = 0

  while (attempt < maxRetries) {
    const session = await payload.db.connection.startSession()
    
    try {
      session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        maxTimeMS: timeout
      })

      const result = await operation(session)
      await session.commitTransaction()
      return result
    } catch (error) {
      await session.abortTransaction()
      
      if (error.name === 'WriteConflict' && attempt < maxRetries - 1) {
        attempt++
        continue
      }
      throw error
    } finally {
      await session.endSession()
    }
  }
}