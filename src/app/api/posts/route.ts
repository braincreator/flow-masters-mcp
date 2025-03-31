import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const locale = (searchParams.get('locale') as Locale) || DEFAULT_LOCALE
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const tag = searchParams.get('tag') || undefined
    const author = searchParams.get('author') || undefined

    console.log(`Posts API: Fetching posts for locale ${locale}, page ${page}, limit ${limit}`)
    console.log(
      `Posts API: Filters - search: ${search}, category: ${category}, tag: ${tag}, author: ${author}`,
    )

    try {
      const payload = await getPayloadClient()
      console.log('Posts API: Payload client initialized')

      // Construct query - removed 'published' field check that was causing errors
      const query: any = {
        and: [],
      }

      // Add search condition if provided
      if (search) {
        query.and.push({
          or: [
            {
              title: {
                like: search,
              },
            },
            {
              excerpt: {
                like: search,
              },
            },
            {
              'content.richText': {
                like: search,
              },
            },
          ],
        })
      }

      // Add category filter if provided
      if (category) {
        query.and.push({
          categories: {
            in: category,
          },
        })
      }

      // Add tag filter if provided
      if (tag) {
        query.and.push({
          tags: {
            in: tag,
          },
        })
      }

      // Add author filter if provided
      if (author) {
        query.and.push({
          author: {
            in: author,
          },
        })
      }

      // Only add the "and" condition if there are filters
      if (query.and.length === 0) {
        delete query.and
      }

      console.log('Posts API: Constructed query', JSON.stringify(query))

      try {
        // Fetch posts
        const posts = await payload.find({
          collection: 'posts',
          where: query,
          page,
          limit,
          sort: '-publishedAt',
          locale,
          depth: 2, // Load related data with depth of 2
        })

        console.log(`Posts API: Found ${posts.docs.length} posts`)

        // Format data to standardize the response
        const formattedPosts = posts.docs.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          publishedAt: post.publishedAt,
          heroImage: post.heroImage
            ? {
                url: post.heroImage.url,
                alt: post.heroImage.alt || post.title,
              }
            : undefined,
          author: post.author
            ? {
                id: post.author.id,
                name: post.author.name,
                avatar: post.author.avatar?.url,
              }
            : undefined,
          categories: post.categories?.map((category: any) => ({
            id: category.id,
            title: category.title,
            slug: category.slug,
          })),
          readTime: post.readTime || undefined,
        }))

        return NextResponse.json({
          docs: formattedPosts,
          totalDocs: posts.totalDocs,
          totalPages: posts.totalPages,
          page: posts.page,
          hasPrevPage: posts.hasPrevPage,
          hasNextPage: posts.hasNextPage,
        })
      } catch (queryError) {
        console.error('Posts API: Error querying posts collection:', queryError)
        return NextResponse.json(
          { error: 'Error querying posts collection', details: String(queryError) },
          { status: 500 },
        )
      }
    } catch (payloadError) {
      console.error('Posts API: Error initializing Payload client:', payloadError)
      return NextResponse.json(
        { error: 'Error initializing Payload client', details: String(payloadError) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Posts API: General error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 },
    )
  }
}
