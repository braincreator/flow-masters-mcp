import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const locale = (searchParams.get('locale') as Locale) || DEFAULT_LOCALE

    console.log(`Tags API: Fetching tags for locale ${locale}`)

    const payload = await getPayloadClient()
    console.log('Tags API: Payload client initialized')

    // Fetch tags
    try {
      const tags = await payload.find({
        collection: 'tags',
        limit: 100, // Fetch up to 100 tags
        locale,
      })
      console.log(`Tags API: Found ${tags.docs.length} tags`)

      // Fetch post counts for each tag
      const tagsWithCount = await Promise.all(
        tags.docs.map(async (tag) => {
          try {
            // Modified query to avoid using the 'published' field that's causing errors
            // Instead, just count all posts associated with this tag
            const postsCount = await payload.find({
              collection: 'posts',
              where: {
                tags: {
                  in: tag.id,
                },
              },
              limit: 0, // We only need the count
            })

            return {
              id: tag.id,
              title: tag.title,
              slug: tag.slug,
              count: postsCount.totalDocs,
            }
          } catch (err) {
            console.error(`Tags API: Error fetching post count for tag ${tag.id}:`, err)
            // Return the tag without count in case of error
            return {
              id: tag.id,
              title: tag.title,
              slug: tag.slug,
              count: 0,
            }
          }
        }),
      )

      // Sort tags by count (most posts first)
      // We're removing the filter for zero counts to ensure tags show up
      const sortedTags = tagsWithCount.sort((a, b) => b.count - a.count)

      return NextResponse.json(sortedTags)
    } catch (collectionError) {
      console.error('Tags API: Error accessing tags collection:', collectionError)
      return NextResponse.json(
        { error: 'Error accessing tags collection', details: String(collectionError) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Tags API: Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 },
    )
  }
}
