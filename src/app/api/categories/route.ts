import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const locale = (searchParams.get('locale') as Locale) || DEFAULT_LOCALE

    console.log(`Categories API: Fetching categories for locale ${locale}`)

    try {
      const payload = await getPayloadClient()
      console.log('Categories API: Payload client initialized')

      // Fetch categories
      try {
        const categories = await payload.find({
          collection: 'categories',
          limit: 100, // Fetch up to 100 categories
          locale,
        })
        console.log(`Categories API: Found ${categories.docs.length} categories`)

        // Fetch post counts for each category (optional)
        const categoriesWithCount = await Promise.all(
          categories.docs.map(async (category) => {
            try {
              // Modified query to avoid using the 'published' field that's causing errors
              // Instead, just count all posts associated with this category
              const postsCount = await payload.find({
                collection: 'posts',
                where: {
                  categories: {
                    in: category.id,
                  },
                },
                limit: 0, // We only need the count
              })

              return {
                id: category.id,
                title: category.title,
                slug: category.slug,
                count: postsCount.totalDocs,
              }
            } catch (err) {
              console.error(
                `Categories API: Error fetching post count for category ${category.id}:`,
                err,
              )
              // Return the category without count in case of error
              return {
                id: category.id,
                title: category.title,
                slug: category.slug,
                count: 0,
              }
            }
          }),
        )

        // Sort categories by count (most posts first)
        // We're removing the filter for zero counts to ensure categories show up
        const sortedCategories = categoriesWithCount.sort((a, b) => b.count - a.count)

        return NextResponse.json(sortedCategories)
      } catch (collectionError) {
        console.error('Categories API: Error accessing categories collection:', collectionError)
        return NextResponse.json(
          { error: 'Error accessing categories collection', details: String(collectionError) },
          { status: 500 },
        )
      }
    } catch (payloadError) {
      console.error('Categories API: Error initializing Payload client:', payloadError)
      return NextResponse.json(
        { error: 'Error initializing Payload client', details: String(payloadError) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Categories API: General error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 },
    )
  }
}
