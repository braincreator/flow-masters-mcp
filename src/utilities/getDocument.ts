import type { Config } from 'src/payload-types'
import { getPayloadClient } from './payload'
import { unstable_cache } from 'next/cache'
import { LRUCache } from 'lru-cache'

type Collection = keyof Config['collections']

// LRU cache configuration
const documentCache = new LRUCache({
  max: 500,
  maxAge: 1000 * 60 * 60, // 1 hour
  updateAgeOnGet: true,
})

async function getDocument(collection: Collection, slug: string, depth = 0) {
  const payload = await getPayloadClient()

  try {
    const page = await payload.find({
      collection,
      depth,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return page.docs[0]
  } catch (error) {
    console.error(`Error fetching document from ${collection}:`, error)
    throw error
  }
}

export const getCachedDocument = (collection: Collection, slug: string, depth = 0) => {
  const cacheKey = `${collection}_${slug}_${depth}`
  
  return unstable_cache(
    async () => {
      const cached = documentCache.get(cacheKey)
      if (cached) return cached

      const doc = await getDocument(collection, slug, depth)
      
      if (doc) {
        // Limit cache size
        if (documentCache.size > 1000) {
          const oldestKey = documentCache.keys().next().value
          documentCache.delete(oldestKey)
        }
        documentCache.set(cacheKey, doc)
      }
      
      return doc
    },
    [collection, slug, depth],
    {
      tags: [cacheKey, collection],
      revalidate: 3600,
      maxAge: 3600 // 1 hour
    }
  )
}

// More aggressive memory management
if (typeof process !== 'undefined') {
  process.on('memory', (info) => {
    if (info.heapUsed / info.heapTotal > 0.8) { // Lower threshold
      console.warn('High memory usage detected, clearing document cache')
      documentCache.reset()
    }
  })
}

// Export the direct function for cases where caching is not desired
export { getDocument }
