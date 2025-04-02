import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as Locale) || DEFAULT_LOCALE

    console.log(`Categories API: Fetching blog categories for locale ${locale}`)

    try {
      const payload = await getPayloadClient()
      console.log('Categories API: Payload client initialized')

      // Fetch categories
      try {
        const categories = await payload.find({
          collection: 'categories',
          limit: 100,
          locale,
        })
        console.log(`Categories API: Found ${categories.docs.length} categories`)

        // Упрощаем маппинг: считаем посты для всех категорий (теперь это только категории блога)
        const categoriesWithCount = await Promise.all(
          categories.docs.map(async (category) => {
            try {
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
                description: category.description,
                // Убираем добавление полей productCategoryDetails
                // Добавляем поля blogCategoryDetails для всех
                ...(category.blogCategoryDetails
                  ? {
                      showInSidebar: category.blogCategoryDetails.showInSidebar,
                      color: category.blogCategoryDetails.color,
                    }
                  : {}),
              }
            } catch (err) {
              console.error(
                `Categories API: Error fetching post count for category ${category.id}:`,
                err,
              )
              return {
                id: category.id,
                title: category.title,
                slug: category.slug,
                count: 0,
                description: category.description,
              }
            }
          }),
        )

        // Сортируем по количеству постов
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

// POST handler removed
