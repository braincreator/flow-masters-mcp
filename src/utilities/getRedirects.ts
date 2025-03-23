import { LRUCache } from 'lru-cache'
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/utilities/payload'

// Add LRU cache for frequently accessed redirects
const redirectCache = new LRUCache({
  max: 100,
  maxAge: 1000 * 60 * 5, // 5 minutes
})

export async function getRedirects(depth = 1) {
  const payload = await getPayloadClient()

  try {
    const { docs: redirects } = await payload.find({
      collection: 'redirects',
      depth,
      limit: 0,
      pagination: false,
    })

    return redirects
  } catch (error) {
    console.error('Error in getRedirects:', error)
    // ISSUE: Should return cached data if available during error
    const cached = redirectCache.get('redirects')
    if (cached) return cached
    throw error
  }
}

export const getCachedRedirects = () =>
  unstable_cache(
    async () => {
      const redirects = await getRedirects()
      redirectCache.set('redirects', redirects)
      return redirects
    },
    ['redirects'],
    {
      tags: ['redirects'],
      revalidate: 3600 // 1 hour
    }
  )
