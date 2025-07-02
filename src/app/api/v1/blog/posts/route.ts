import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const locale = searchParams.get('locale') || 'en'
    const sort = searchParams.get('sort') || '-publishedAt'
    const categorySlug = searchParams.get('category') || ''
    const tagSlug = searchParams.get('tag') || ''
    const authorId = searchParams.get('author') || ''
    const searchQuery = searchParams.get('search') || ''

    logDebug('[Blog Posts API] Request params:', {
      page,
      limit,
      locale,
      sort,
      categorySlug,
      tagSlug,
      authorId,
      searchQuery
    })

    const payload = await getPayloadClient()

    // Debug: Check available collections
    try {
      const collections = payload.config.collections
      logDebug('[Blog Posts API] Available collections:', collections.map(c => c.slug))
    } catch (err) {
      logWarn('[Blog Posts API] Could not list collections:', err)
    }

    // Build where clause
    const where: any = {
      _status: { equals: 'published' }
    }

    // Add search query if provided
    if (searchQuery) {
      where.or = [
        { title: { contains: searchQuery } },
        { excerpt: { contains: searchQuery } },
        { content: { contains: searchQuery } }
      ]
    }

    // Add category filter if provided
    if (categorySlug) {
      try {
        const categories = await payload.find({
          collection: 'categories',
          where: { slug: { equals: categorySlug } },
          limit: 1
        })
        
        if (categories.docs.length > 0) {
          where.categories = { in: [categories.docs[0].id] }
        }
      } catch (error) {
        logError('[Blog Posts API] Error finding category:', error)
      }
    }

    // Add tag filter if provided
    if (tagSlug) {
      try {
        const tags = await payload.find({
          collection: 'tags',
          where: { slug: { equals: tagSlug } },
          limit: 1
        })
        
        if (tags.docs.length > 0) {
          where.tags = { in: [tags.docs[0].id] }
        }
      } catch (error) {
        logError('[Blog Posts API] Error finding tag:', error)
      }
    }

    // Add author filter if provided
    if (authorId) {
      where.authors = { in: [authorId] }
    }

    logDebug('[Blog Posts API] Where clause:', JSON.stringify(where, null, 2))

    // Fetch posts
    const posts = await payload.find({
      collection: 'posts',
      where,
      sort,
      limit,
      page,
      depth: 2, // Load relations
      locale
    })

    logDebug('[Blog Posts API] Found posts:', posts.docs.length)

    return NextResponse.json(posts)
  } catch (error) {
    logError('[Blog Posts API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch blog posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
