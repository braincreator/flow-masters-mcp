import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as Locale) || DEFAULT_LOCALE

    logDebug(`Categories API: Fetching blog categories for locale ${locale}`)

    try {
      const payload = await getPayloadClient()
      logDebug('Categories API: Payload client initialized')

      // Fetch categories
      try {
        const categories = await payload.find({
          collection: 'categories',
          limit: 100,
          locale,
        })
        logDebug(`Categories API: Found ${categories.docs.length} categories`)

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
              logError(
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
        logError('Categories API: Error accessing categories collection:', collectionError)
        return NextResponse.json(
          { error: 'Error accessing categories collection', details: String(collectionError) },
          { status: 500 },
        )
      }
    } catch (payloadError) {
      logError('Categories API: Error initializing Payload client:', payloadError)
      return NextResponse.json(
        { error: 'Error initializing Payload client', details: String(payloadError) },
        { status: 500 },
      )
    }
  } catch (error) {
    logError('Categories API: General error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 },
    )
  }
}

// POST handler removed
