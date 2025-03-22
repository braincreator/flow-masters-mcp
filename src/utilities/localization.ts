import { LRUCache } from 'lru-cache'
import fs from 'fs/promises'
import path from 'path'

const CACHE_FILE = path.join(process.cwd(), '.cache', 'locale-cache.json')

const localeCache = new LRUCache({
  max: 1000,
  maxAge: 1000 * 60 * 60,
  updateAgeOnGet: true,
  dispose: (value) => {
    // Clean up references
    if (value && typeof value === 'object') {
      Object.keys(value).forEach(k => {
        (value as any)[k] = null
      })
    }
  },
  sizeCalculation: (value) => {
    return JSON.stringify(value).length
  },
  maxSize: 5000000 // 5MB total cache size
})

let memoryCheckInterval: NodeJS.Timeout

// Memory pressure handling with proper cleanup
if (typeof process !== 'undefined') {
  if (memoryCheckInterval) clearInterval(memoryCheckInterval)
  
  memoryCheckInterval = setInterval(() => {
    const usage = process.memoryUsage()
    if (usage.heapUsed > usage.heapTotal * 0.8) {
      localeCache.clear()
    }
  }, 300000) // 5 minutes
}

export const cleanupLocaleCache = () => {
  if (memoryCheckInterval) clearInterval(memoryCheckInterval)
  localeCache.clear()
}

const metrics = {
  hits: 0,
  misses: 0,
  errors: 0
}

const performance = {
  fetchTimes: [] as number[],
  avgFetchTime: 0,
  maxFetchTime: 0
}

export const getLocalizationMetrics = () => ({
  ...metrics,
  cacheSize: localeCache.size,
  itemCount: localeCache.itemCount
})

export const getPerformanceMetrics = () => ({
  ...performance,
  avgFetchTime: performance.fetchTimes.reduce((a, b) => a + b, 0) / performance.fetchTimes.length || 0
})

const getFallbackLocale = (locale: string): string => {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return DEFAULT_LOCALE
  }
  return locale
}

export const getLocalizedContent = async (
  collection: string,
  docId: string,
  locale: string,
  useFallback = true
) => {
  const cacheKey = `${collection}:${docId}:${locale}`
  const startTime = Date.now()
  
  try {
    let content = localeCache.get(cacheKey)
    if (content) {
      metrics.hits++
      return content
    }
    
    metrics.misses++
    content = await fetchLocalizedContent(collection, docId, locale)
    
    // Try fallback if content not found
    if (!content && useFallback && locale !== DEFAULT_LOCALE) {
      content = await fetchLocalizedContent(collection, docId, DEFAULT_LOCALE)
      if (content) {
        console.debug(`Using fallback locale ${DEFAULT_LOCALE} for ${collection}:${docId}`)
      }
    }

    if (content) {
      localeCache.set(cacheKey, content)
    }
    const fetchTime = Date.now() - startTime
    performance.fetchTimes.push(fetchTime)
    performance.fetchTimes = performance.fetchTimes.slice(-100) // Keep last 100 measurements
    performance.maxFetchTime = Math.max(performance.maxFetchTime, fetchTime)
    return content
  } catch (error) {
    metrics.errors++
    throw error
  }
}

// Add cache invalidation on locale updates
export const invalidateLocaleCache = (
  collection: string,
  docId: string
) => {
  const pattern = new RegExp(`^${collection}:${docId}:`)
  for (const key of localeCache.keys()) {
    if (pattern.test(key)) {
      localeCache.del(key)
    }
  }
}

export const getLocalizedContentBatch = async (
  items: Array<{collection: string, docId: string, locale: string}>
) => {
  const results = await Promise.all(
    items.map(async ({collection, docId, locale}) => {
      try {
        return await getLocalizedContent(collection, docId, locale)
      } catch (error) {
        console.error(`Batch localization failed for ${collection}:${docId}:${locale}`)
        return null
      }
    })
  )
  return results.filter(Boolean)
}

export const preloadCommonContent = async () => {
  const commonCollections = ['header', 'footer', 'navigation']
  const preloadTasks = []

  for (const collection of commonCollections) {
    for (const locale of SUPPORTED_LOCALES) {
      preloadTasks.push(
        getLocalizedContent(collection, 'main', locale)
          .catch(error => console.error(`Preload failed for ${collection}:${locale}`, error))
      )
    }
  }

  await Promise.allSettled(preloadTasks)
}

// Add cache warming on startup
if (typeof process !== 'undefined') {
  preloadCommonContent()
    .then(() => console.log('Common content preloaded'))
    .catch(error => console.error('Failed to preload common content:', error))
}

export const persistCache = async () => {
  try {
    const cacheData = Array.from(localeCache.entries())
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true })
    await fs.writeFile(CACHE_FILE, JSON.stringify(cacheData))
    console.log('Locale cache persisted successfully')
  } catch (error) {
    console.error('Failed to persist locale cache:', error)
  }
}

export const loadPersistedCache = async () => {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8')
    const cacheData = JSON.parse(data)
    for (const [key, value] of cacheData) {
      localeCache.set(key, value)
    }
    console.log('Loaded persisted locale cache')
  } catch (error) {
    console.error('Failed to load persisted locale cache:', error)
  }
}

// Add periodic cache persistence
if (typeof process !== 'undefined') {
  setInterval(persistCache, 1000 * 60 * 30) // Every 30 minutes
  process.on('SIGTERM', persistCache)
}
