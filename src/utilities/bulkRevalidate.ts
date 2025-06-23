import type { Payload } from 'payload'
import { revalidateContent } from '@/utilities/revalidation'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function bulkRevalidate(
  payload: Payload, 
  collections: string[],
  signal?: AbortSignal
) {
  const activeOperations = new Set()
  const chunkSize = 5
  
  try {
    for (let i = 0; i < collections.length; i += chunkSize) {
      if (signal?.aborted) {
        throw new Error('Revalidation aborted')
      }

      const chunk = collections.slice(i, i + chunkSize)
      const operations = new Map()
      
      await Promise.all(chunk.map(async (collection) => {
        const operation = payload.find({
          collection,
          where: { _status: { equals: 'published' } },
          depth: 0,
        })
        
        operations.set(collection, operation)
        activeOperations.add(operation)

        try {
          const docs = await operation
          await Promise.all(docs.docs.map(doc => 
            revalidateContent({
              collection,
              slug: doc.slug,
              payload,
              type: ['page', 'layout']
            }).catch(console.error)
          ))
        } finally {
          operations.delete(collection)
          activeOperations.delete(operation)
        }
      }))

      // Force garbage collection between chunks
      if (global.gc) {
        global.gc()
      }
    }
  } finally {
    // Cleanup any remaining operations
    activeOperations.forEach(operation => {
      if (operation.abort) {
        operation.abort()
      }
    })
    activeOperations.clear()
  }
}
