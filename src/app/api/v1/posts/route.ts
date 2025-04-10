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

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // Check content type to determine how to parse the body
    const contentType = request.headers.get('content-type') || ''
    let body

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      body = {
        where: {},
        limit: parseInt(formData.get('limit') as string) || 10,
        page: parseInt(formData.get('page') as string) || 1,
        sort: (formData.get('sort') as string) || '-publishedAt',
        depth: parseInt(formData.get('depth') as string) || 1,
      }
    } else {
      // Default to empty query if content type is not recognized
      body = {
        where: {},
        limit: 10,
        page: 1,
        sort: '-publishedAt',
        depth: 1,
      }
    }

    const posts = await payload.find({
      collection: 'posts',
      where: body.where || {},
      limit: body.limit || 10,
      page: body.page || 1,
      sort: body.sort || '-publishedAt',
      depth: body.depth || 1,
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Posts API: Error in POST method:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 },
    )
  }
}
