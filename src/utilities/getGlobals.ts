import { cache } from 'react'
import { LRUCache } from 'lru-cache'
import type { GlobalPayload } from 'payload/types'
import { getPayloadClient } from './payload'

// Strongly type the globals
type GlobalSlug = 'header' | 'footer' | 'navigation'

const CACHE_REVALIDATE_SECONDS = 3600 // 1 hour

// Configure LRU cache with proper types
const globalCache = new LRUCache<string, GlobalPayload>({
  max: 1000,
  ttl: CACHE_REVALIDATE_SECONDS * 1000,
  updateAgeOnGet: true,
  dispose: (value, key) => {
    // Cleanup any references
    if (value && typeof value === 'object') {
      Object.keys(value).forEach(k => {
        (value as any)[k] = null
      })
    }
  }
})

interface GetGlobalOptions {
  slug: GlobalSlug
  depth?: number
  locale?: string
  forceFresh?: boolean
}

// Separate uncached function for direct access
async function getGlobal({ slug, depth = 1, locale }: GetGlobalOptions): Promise<GlobalPayload> {
  const payload = await getPayloadClient()
  
  try {
    const global = await payload.findGlobal({
      slug,
      depth,
      locale,
      draft: false,
    })

    if (!global) {
      throw new Error(`Global not found: ${slug}`)
    }

    return global
  } catch (error) {
    console.error(`Error fetching global ${slug}:`, error)
    // Check cache on error
    const cacheKey = `global-${slug}-${locale}-${depth}`
    const cachedData = globalCache.get(cacheKey)
    if (cachedData) {
      console.log(`Serving cached data for ${slug} due to error`)
      return cachedData
    }
    throw error
  }
}

// Main cached function
export const getCachedGlobal = ({
  slug,
  depth = 1,
  locale,
  forceFresh = false,
}: GetGlobalOptions) =>
  cache(
    async () => {
      const cacheKey = `global-${slug}-${locale}-${depth}`

      // Check LRU cache first unless forceFresh is true
      if (!forceFresh) {
        const cached = globalCache.get(cacheKey)
        if (cached) {
          return cached
        }
      }

      const global = await getGlobal({ slug, depth, locale })
      
      // Update LRU cache
      globalCache.set(cacheKey, global)
      
      return global
    },
    [`global-${slug}-${locale}-${depth}`],
  )

// Cache invalidation helper
export const invalidateGlobalCache = (slug: GlobalSlug, locale?: string) => {
  const pattern = new RegExp(`^global-${slug}${locale ? `-${locale}` : ''}`)
  for (const key of globalCache.keys()) {
    if (pattern.test(key)) {
      globalCache.delete(key)
    }
  }
}

// Memory pressure handling
let memoryInterval: NodeJS.Timeout

if (typeof process !== 'undefined') {
  // Clear existing interval if it exists
  if (memoryInterval) clearInterval(memoryInterval)
  
  memoryInterval = setInterval(() => {
    const usage = process.memoryUsage()
    if (usage.heapUsed / usage.heapTotal > 0.9) {
      globalCache.clear()
    }
  }, 300000) // 5 minutes
}

// Cleanup function
export const cleanupGlobalCache = () => {
  if (memoryInterval) clearInterval(memoryInterval)
  globalCache.clear()
}

// Export direct access function
export { getGlobal }
