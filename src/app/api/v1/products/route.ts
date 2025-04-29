import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { convertPrice } from '@/utilities/formatPrice'

interface ApiError {
  message: string
  details?: any
}

// Helper function to create a consistent API response even in error cases
function createApiResponse(
  success = true,
  data: any = null,
  error: ApiError | null = null,
  status = 200,
) {
  if (success) {
    return NextResponse.json(data, { status })
  } else {
    // Create a fallback response structure that matches what the client expects
    return NextResponse.json(
      {
        docs: [],
        totalDocs: 0,
        limit: 12,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
        error: error?.message || 'Unknown error',
        details: error?.details || {},
      },
      { status },
    )
  }
}

export async function GET(request: Request) {
  try {
    console.log('=== Products API Request ===')
    console.log('URL:', request.url)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const locale = (searchParams.get('locale') || DEFAULT_LOCALE) as Locale
    const search = searchParams.get('search') || ''
    const productCategory = searchParams.get('where[productCategory][equals]') || ''
    const productType = searchParams.get('productType') || ''
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
      ? parseInt(searchParams.get('minPrice')!)
      : undefined
    const maxPrice = searchParams.get('maxPrice')
      ? parseInt(searchParams.get('maxPrice')!)
      : undefined

    console.log('API Request params:', {
      page,
      limit,
      locale,
      search,
      productCategory,
      productType,
      sort,
      minPrice,
      maxPrice,
    })

    // Validate parameters
    if (isNaN(page) || page < 1) {
      console.error('Invalid page parameter:', searchParams.get('page'))
      return createApiResponse(false, null, { message: 'Invalid page parameter' }, 400)
    }

    if (isNaN(limit) || limit < 1) {
      console.error('Invalid limit parameter:', searchParams.get('limit'))
      return createApiResponse(false, null, { message: 'Invalid limit parameter' }, 400)
    }

    if (minPrice !== undefined && isNaN(minPrice)) {
      console.error('Invalid minPrice parameter:', searchParams.get('minPrice'))
      return createApiResponse(false, null, { message: 'Invalid minPrice parameter' }, 400)
    }

    if (maxPrice !== undefined && isNaN(maxPrice)) {
      console.error('Invalid maxPrice parameter:', searchParams.get('maxPrice'))
      return createApiResponse(false, null, { message: 'Invalid maxPrice parameter' }, 400)
    }

    let payload
    try {
      payload = await getPayloadClient()

      // Log the product collection structure to understand available fields
      try {
        const productCollection = await payload.collections.products.config
        console.log(
          'Product collection fields:',
          productCollection.fields.map((field: any) => ({
            name: field.name,
            type: field.type,
            required: field.required || false,
          })),
        )
      } catch (err) {
        console.log('Could not log product collection structure:', err)
      }
    } catch (payloadError: any) {
      console.error('Failed to initialize Payload client:', payloadError)
      return createApiResponse(
        false,
        null,
        { message: 'Database connection failed', details: payloadError?.message },
        500,
      )
    }

    // Build the where query
    const where: any = {
      // status: { // Временно убираем фильтр по статусу
      //   equals: 'published',
      // },
    }

    // Store price filtering parameters for client-side filtering
    const priceFilters = {
      minPrice,
      maxPrice,
      shouldFilter: minPrice !== undefined || maxPrice !== undefined,
    }

    // Add search filter
    // if (search) { // Временно убираем фильтр по поиску
    //   where.or = [
    //     {
    //       title: {
    //         contains: search,
    //       },
    //     },
    //     {
    //       description: {
    //         contains: search,
    //       },
    //     },
    //   ]
    // }

    // Add productCategory filter
    if (productCategory && productCategory !== 'all') {
      where.productCategory = {
        equals: productCategory,
      }
    }

    // Add product type filter
    if (productType && productType !== 'all') {
      where.productType = {
        equals: productType,
      }
    }

    // Note: We're removing price filtering from the database query
    // Price filtering will be done client-side after fetching products

    // Determine sort field and direction
    let sortOption = '-createdAt' // Default sort: newest first
    if (sort === 'price-asc') {
      sortOption = 'pricing.finalPrice' // Price low to high
    } else if (sort === 'price') {
      sortOption = '-pricing.finalPrice' // Price high to low
    }

    console.log('Payload query:', {
      collection: 'products',
      where,
      page,
      limit,
      locale,
      sort: sortOption,
    })

    try {
      // Check if collection exists
      if (!payload.collections || !payload.collections.products) {
        console.error('Products collection not found in Payload')
        return createApiResponse(false, null, { message: 'Products collection not found' }, 500)
      }

      // Try a simplified query first to check structure
      try {
        const sampleProduct = await payload.find({
          collection: 'products',
          limit: 1,
        })
        console.log(
          'Sample product structure:',
          sampleProduct.docs && sampleProduct.docs.length > 0
            ? Object.keys(sampleProduct.docs[0] as object)
            : 'No products found',
        )
      } catch (err: any) {
        console.log('Sample query failed:', err.message)
      }

      // Fetch products
      const products = await payload.find({
        collection: 'products',
        where,
        page,
        limit,
        locale,
        sort: sortOption,
      })

      console.log(`Found ${products.docs?.length || 0} products, total: ${products.totalDocs || 0}`)

      // Apply price filtering client-side if needed
      if (priceFilters.shouldFilter && Array.isArray(products.docs)) {
        console.log('Applying client-side price filtering:', priceFilters)

        const filteredDocs = products.docs.filter((product) => {
          // Get the price from the nested pricing structure
          const productWithPrice = product as any
          if (!productWithPrice || !productWithPrice.pricing) return false

          // Use finalPrice if available, otherwise basePrice
          const productPrice =
            productWithPrice.pricing.finalPrice || productWithPrice.pricing.basePrice
          if (typeof productPrice !== 'number') return false

          // Конвертируем цену продукта для сравнения, если нужно
          let comparePrice = productPrice
          if (locale !== 'en') {
            // Конвертируем из USD в локальную валюту
            comparePrice = convertPrice(productPrice, 'en', locale)
          }

          // Логируем исходную цену и конвертированную
          console.log(`Продукт: ${productWithPrice.title}`)
          console.log(`- Цена в USD: ${productPrice}$`)
          console.log(`- Цена в локальной валюте: ${comparePrice}`)
          console.log(
            `- Фильтр: от ${priceFilters.minPrice || 0} до ${priceFilters.maxPrice || '∞'}`,
          )

          // Делаем сравнение
          const meetsMinPrice =
            priceFilters.minPrice === undefined || comparePrice >= priceFilters.minPrice
          const meetsMaxPrice =
            priceFilters.maxPrice === undefined || comparePrice <= priceFilters.maxPrice

          const isMatching = meetsMinPrice && meetsMaxPrice
          console.log(`- Результат: ${isMatching ? 'СООТВЕТСТВУЕТ' : 'НЕ СООТВЕТСТВУЕТ'} диапазону`)
          console.log(
            `- Причина: мин=${meetsMinPrice ? 'ДА' : 'НЕТ'}, макс=${meetsMaxPrice ? 'ДА' : 'НЕТ'}`,
          )

          return isMatching
        })

        // Update the products object with filtered results
        const filteredProducts = {
          ...products,
          docs: filteredDocs,
          totalDocs: filteredDocs.length,
          // We're not recalculating pagination here, which is a limitation
        }

        console.log(
          `После фильтрации по цене: найдено ${filteredDocs.length} товаров из ${products.docs.length}`,
        )
        return createApiResponse(true, filteredProducts)
      }

      return createApiResponse(true, products)
    } catch (payloadError: any) {
      console.error('Payload query error:', payloadError)
      return createApiResponse(
        false,
        null,
        { message: 'Database query failed', details: payloadError?.message },
        500,
      )
    }
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return createApiResponse(
      false,
      null,
      { message: 'Failed to fetch products', details: error?.message },
      500,
    )
  }
}
