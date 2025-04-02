import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const locale = (searchParams.get('locale') as Locale) || DEFAULT_LOCALE
    const categoryType = searchParams.get('type') // Get category type from query params

    console.log(
      `Categories API: Fetching categories for locale ${locale}${categoryType ? ` and type ${categoryType}` : ''}`,
    )

    try {
      const payload = await getPayloadClient()
      console.log('Categories API: Payload client initialized')

      // Prepare where clause based on categoryType
      const whereClause = categoryType
        ? {
            categoryType: {
              equals: categoryType,
            },
          }
        : {}

      // Fetch categories
      try {
        const categories = await payload.find({
          collection: 'categories',
          limit: 100, // Fetch up to 100 categories
          locale,
          where: whereClause,
        })
        console.log(`Categories API: Found ${categories.docs.length} categories`)

        // Fetch post counts for each category (optional)
        const categoriesWithCount = await Promise.all(
          categories.docs.map(async (category) => {
            try {
              // If it's a blog category, fetch post counts
              if (!categoryType || categoryType === 'blog') {
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
                  categoryType: category.categoryType,
                  description: category.description,
                  // Include type-specific fields conditionally
                  ...(category.categoryType === 'product' && category.productCategoryDetails
                    ? {
                        featuredInNav: category.productCategoryDetails.featuredInNav,
                        displayOrder: category.productCategoryDetails.displayOrder,
                        icon: category.productCategoryDetails.icon,
                      }
                    : {}),
                  ...(category.categoryType === 'blog' && category.blogCategoryDetails
                    ? {
                        showInSidebar: category.blogCategoryDetails.showInSidebar,
                        color: category.blogCategoryDetails.color,
                      }
                    : {}),
                }
              }

              // For product or general categories, don't fetch post counts
              return {
                id: category.id,
                title: category.title,
                slug: category.slug,
                count: 0,
                categoryType: category.categoryType,
                description: category.description,
                // Include type-specific fields conditionally
                ...(category.categoryType === 'product' && category.productCategoryDetails
                  ? {
                      featuredInNav: category.productCategoryDetails.featuredInNav,
                      displayOrder: category.productCategoryDetails.displayOrder,
                      icon: category.productCategoryDetails.icon,
                    }
                  : {}),
                ...(category.categoryType === 'blog' && category.blogCategoryDetails
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
              // Return the category without count in case of error
              return {
                id: category.id,
                title: category.title,
                slug: category.slug,
                count: 0,
                categoryType: category.categoryType,
                description: category.description,
              }
            }
          }),
        )

        // Sort categories based on type
        let sortedCategories = categoriesWithCount

        if (!categoryType || categoryType === 'blog') {
          // Sort blog categories by post count
          sortedCategories = categoriesWithCount.sort((a, b) => b.count - a.count)
        } else if (categoryType === 'product') {
          // Sort product categories by display order if available
          sortedCategories = categoriesWithCount.sort((a, b) => {
            if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
              return a.displayOrder - b.displayOrder
            }
            return 0
          })
        }

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
