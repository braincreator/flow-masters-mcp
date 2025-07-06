import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(req: NextRequest) {
  const payload = await getPayloadClient()
  try {
    // Get search query from URL
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          docs: [],
          message: 'Search query must be at least 2 characters',
        },
        { status: 400 },
      )
    }

    // Get additional filters
    const categorySlug = searchParams.get('category')
    const tagSlug = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Construct the where query
    const where: any = {
      and: [
        {
          or: [
            {
              title: {
                like: query,
              },
            },
            {
              excerpt: {
                like: query,
              },
            },
            {
              content: {
                like: query,
              },
            },
          ],
        },
        // Only published posts
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    }

    // Add category filter if provided
    if (categorySlug) {
      where.and.push({
        'categories.slug': {
          equals: categorySlug,
        },
      })
    }

    // Add tag filter if provided
    if (tagSlug) {
      where.and.push({
        'tags.slug': {
          equals: tagSlug,
        },
      })
    }

    // Execute the search
    const result = await payload.find({
      collection: 'posts',
      where,
      page,
      limit,
      sort: '-publishedAt',
      depth: 1, // Load relationships one level deep
    })

    // Transform results for frontend consumption
    const posts = result.docs.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      heroImage: post.heroImage && typeof post.heroImage === 'object'
        ? {
            url: post.heroImage.url,
            alt: post.heroImage.alt,
          }
        : undefined,
      author: post.authors && Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
        ? {
            id: post.authors[0].id,
            name: post.authors[0].name,
            slug: (post.authors[0] as any).slug, // Assuming slug is available but not in base User type
            avatar: (post.authors[0] as any).instructorProfilePicture?.url, // Use instructorProfilePicture for avatar
          }
        : undefined,
      categories: post.categories?.map((cat) => cat && typeof cat === 'object' ? {
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
      } : undefined).filter(Boolean),
    }))

    return NextResponse.json({
      docs: posts,
      totalDocs: result.totalDocs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    })
  } catch (error) {
    logError('Error searching posts:', error)

    return NextResponse.json(
      {
        error: 'Error searching posts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
