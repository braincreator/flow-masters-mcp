import { cache } from 'react'
import { LRUCache } from 'lru-cache'
import { getPayloadClient, retryOnSessionExpired } from './payload/index'
import { memoryManager } from './memoryManager'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Strongly type the globals
type GlobalSlug = 'header' | 'footer' | 'navigation'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobalPayload = Record<string, any>

const CACHE_REVALIDATE_SECONDS = 3600 // 1 hour

// Configure LRU cache with memory-optimized settings
const globalCache = new LRUCache<string, GlobalPayload>({
  max: 50, // Reduced from 1000 to 50
  ttl: CACHE_REVALIDATE_SECONDS * 1000,
  updateAgeOnGet: true,
  maxSize: 50 * 1024 * 1024, // 50MB max cache size
  sizeCalculation: (value) => {
    // Estimate object size in bytes
    return JSON.stringify(value).length * 2 // Rough estimate
  },
  dispose: (value, _key) => {
    // Cleanup any references
    if (value && typeof value === 'object') {
      Object.keys(value).forEach((k) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(value as any)[k] = null
      })
    }
  },
})

// Регистрируем кэш в менеджере памяти
memoryManager.registerCache(globalCache)

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
    // Используем retryOnSessionExpired для устойчивости к ошибкам сессии MongoDB
    const global = await retryOnSessionExpired(() =>
      payload.findGlobal({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slug: slug as any, // Type assertion for compatibility
        depth,
        locale: locale as 'en' | 'ru' | undefined,
        draft: false,
      }),
    )

    if (!global) {
      throw new Error(`Global not found: ${slug}`)
    }

    return global
  } catch (error) {
    logError(`Error fetching global ${slug}:`, error)
    // Check cache on error
    const cacheKey = `global-${slug}-${locale}-${depth}`
    const cachedData = globalCache.get(cacheKey)
    if (cachedData) {
      logDebug(`Serving cached data for ${slug} due to error`)
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
  cache(async () => {
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
  }, [`global-${slug}-${locale}-${depth}`])

// Cache invalidation helper
export const invalidateGlobalCache = (slug: GlobalSlug, locale?: string) => {
  const pattern = new RegExp(`^global-${slug}${locale ? `-${locale}` : ''}`)
  for (const key of globalCache.keys()) {
    if (pattern.test(key)) {
      globalCache.delete(key)
    }
  }
}

// Memory pressure handling is now managed by the central memory manager
// The globalCache is automatically monitored and cleaned up when needed

// Cleanup function
export const cleanupGlobalCache = () => {
  memoryManager.unregisterCache(globalCache)
  globalCache.clear()
}

// Export direct access function
export { getGlobal }
