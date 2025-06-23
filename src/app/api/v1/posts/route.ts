import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { Post } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Cache for search results
const searchCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to get cached result
function getCachedResult(key: string) {
  const cached = searchCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

// Helper function to set cached result
function setCachedResult(key: string, data: any) {
  searchCache.set(key, { data, timestamp: Date.now() })

  // Clean old cache entries
  if (searchCache.size > 100) {
    const oldestKey = Array.from(searchCache.keys())[0]
    searchCache.delete(oldestKey)
  }
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })

  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50) // Max 50 items
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1) // Min page 1
    const categories = searchParams.get('categories')?.split(',').filter(Boolean)
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const authors = searchParams.get('authors')?.split(',').filter(Boolean)
    const searchQuery = searchParams.get('search')?.trim()
    const sortBy = searchParams.get('sort') || '-publishedAt'

    // Create cache key
    const cacheKey = `posts-${JSON.stringify({
      locale,
      limit,
      page,
      categories,
      tags,
      authors,
      searchQuery,
      sortBy,
    })}`

    // Check cache first
    const cachedResult = getCachedResult(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    logDebug('API received search query:', searchQuery)

    // Build where conditions
    const whereConditions: any[] = [
      {
        _status: {
          equals: 'published',
        },
      },
    ]

    // Add category filter
    if (categories && categories.length > 0) {
      whereConditions.push({
        categories: {
          in: categories,
        },
      })
    }

    // Add tag filter
    if (tags && tags.length > 0) {
      whereConditions.push({
        tags: {
          in: tags,
        },
      })
    }

    // Add author filter
    if (authors && authors.length > 0) {
      whereConditions.push({
        authors: {
          in: authors,
        },
      })
    }

    // Add search condition with improved search logic
    if (searchQuery && searchQuery.length >= 2) {
      const searchTerms = searchQuery
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 1)

      if (searchTerms.length > 0) {
        const searchConditions = searchTerms.map((term) => ({
          or: [
            {
              title: {
                contains: term,
              },
            },
            {
              excerpt: {
                contains: term,
              },
            },
            {
              'meta.description': {
                contains: term,
              },
            },
          ],
        }))

        whereConditions.push({
          and: searchConditions,
        })
      }
    }

    const query: any = {
      collection: 'posts',
      locale,
      limit,
      page,
      where: {
        and: whereConditions,
      },
      sort: sortBy,
      depth: 1, // Fetch related data like author, categories, tags
    }

    const posts = await payload.find(query)

    // Transform and enhance the response
    const transformedPosts = {
      ...posts,
      docs: posts.docs.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
        readingTime: post.readingTime,
        heroImage:
          post.heroImage && typeof post.heroImage === 'object'
            ? {
                url: post.heroImage.url,
                alt: post.heroImage.alt || post.title,
              }
            : undefined,
        thumbnail:
          post.thumbnail && typeof post.thumbnail === 'object'
            ? {
                url: post.thumbnail.url,
                alt: post.thumbnail.alt || post.title,
              }
            : undefined,
        author:
          post.authors &&
          Array.isArray(post.authors) &&
          post.authors.length > 0 &&
          typeof post.authors[0] === 'object'
            ? {
                id: post.authors[0].id,
                name: post.authors[0].name,
                avatar: post.authors[0].instructorProfilePicture?.url,
              }
            : undefined,
        categories: post.categories
          ?.map((cat: any) =>
            cat && typeof cat === 'object'
              ? {
                  id: cat.id,
                  title: cat.title,
                  slug: cat.slug,
                }
              : undefined,
          )
          .filter(Boolean),
        tags: post.tags
          ?.map((tag: any) =>
            tag && typeof tag === 'object'
              ? {
                  id: tag.id,
                  title: tag.title,
                  slug: tag.slug,
                }
              : undefined,
          )
          .filter(Boolean),
      })),
    }

    // Cache the result
    setCachedResult(cacheKey, transformedPosts)

    return NextResponse.json(transformedPosts)
  } catch (error) {
    logError('Error fetching posts:', error)
    return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 })
  }
}
