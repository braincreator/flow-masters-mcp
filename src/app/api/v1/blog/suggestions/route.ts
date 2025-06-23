import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../payload.config'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Cache for suggestions
const suggestionsCache = new Map<string, { data: string[]; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// Helper function to get cached suggestions
function getCachedSuggestions(key: string): string[] | null {
  const cached = suggestionsCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

// Helper function to set cached suggestions
function setCachedSuggestions(key: string, data: string[]) {
  suggestionsCache.set(key, { data, timestamp: Date.now() })
  
  // Clean old cache entries
  if (suggestionsCache.size > 50) {
    const oldestKey = Array.from(suggestionsCache.keys())[0]
    suggestionsCache.delete(oldestKey)
  }
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const locale = searchParams.get('locale') || 'en'

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Create cache key
    const cacheKey = `suggestions-${query}-${locale}`

    // Check cache first
    const cachedSuggestions = getCachedSuggestions(cacheKey)
    if (cachedSuggestions) {
      return NextResponse.json({ suggestions: cachedSuggestions })
    }

    // Get popular search terms from post titles and tags
    const suggestions: string[] = []

    // Search in post titles
    const titleMatches = await payload.find({
      collection: 'posts',
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            title: {
              contains: query,
            },
          },
        ],
      },
      limit: 5,
      locale,
      select: {
        title: true,
      },
    })

    // Add title-based suggestions
    titleMatches.docs.forEach((post: any) => {
      if (post.title && !suggestions.includes(post.title)) {
        suggestions.push(post.title)
      }
    })

    // Search in categories
    try {
      const categoryMatches = await payload.find({
        collection: 'categories',
        where: {
          title: {
            contains: query,
          },
        },
        limit: 3,
        locale,
        select: {
          title: true,
        },
      })

      categoryMatches.docs.forEach((category: any) => {
        if (category.title && !suggestions.includes(category.title)) {
          suggestions.push(category.title)
        }
      })
    } catch (error) {
      // Categories might not exist, continue without them
      logWarn('Categories collection not found or error:', error)
    }

    // Search in tags
    try {
      const tagMatches = await payload.find({
        collection: 'tags',
        where: {
          title: {
            contains: query,
          },
        },
        limit: 3,
        locale,
        select: {
          title: true,
        },
      })

      tagMatches.docs.forEach((tag: any) => {
        if (tag.title && !suggestions.includes(tag.title)) {
          suggestions.push(tag.title)
        }
      })
    } catch (error) {
      // Tags might not exist, continue without them
      logWarn('Tags collection not found or error:', error)
    }

    // Add common search variations
    const commonVariations = [
      `${query} tutorial`,
      `${query} guide`,
      `${query} tips`,
      `how to ${query}`,
      `${query} examples`,
    ]

    commonVariations.forEach(variation => {
      if (suggestions.length < 8 && !suggestions.includes(variation)) {
        suggestions.push(variation)
      }
    })

    // Limit to 8 suggestions and sort by relevance
    const finalSuggestions = suggestions.slice(0, 8)

    // Cache the results
    setCachedSuggestions(cacheKey, finalSuggestions)

    return NextResponse.json({ suggestions: finalSuggestions })
  } catch (error) {
    logError('Error fetching search suggestions:', error)
    return NextResponse.json(
      {
        error: 'Error fetching suggestions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
