import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Locale } from '@/constants'
import type { ProductType } from '@/types/constants'

interface ProductQueryParams {
  category?: string
  search?: string
  sort?: string
  page?: string
  locale: Locale
  minPrice?: number
  maxPrice?: number
  productType?: ProductType
}

export async function getProducts({
  category,
  search,
  sort: sortParam,
  page: pageParam,
  locale,
  minPrice,
  maxPrice,
  productType,
}: ProductQueryParams) {
  const payload = await getPayload({ config: configPromise })

  const where: any = {
    status: {
      equals: 'published',
    },
  }

  if (category && category !== 'all') {
    where.category = {
      equals: category,
    }
  }

  if (productType) {
    where.productType = {
      equals: productType,
    }
  }

  if (search) {
    where.or = [
      {
        title: {
          contains: search,
        },
      },
      {
        description: {
          contains: search,
        },
      },
    ]
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { greater_than_equal: minPrice }),
      ...(maxPrice !== undefined && { less_than_equal: maxPrice }),
    }
  }

  const page = pageParam ? parseInt(pageParam) : 1
  const limit = 12

  const sort =
    sortParam === 'price-low' ? 'price' : sortParam === 'price-high' ? '-price' : '-createdAt'

  const products = await payload.find({
    collection: 'products',
    where,
    sort,
    page,
    limit,
    locale,
  })

  return {
    items: products.docs,
    totalPages: products.totalPages,
    totalItems: products.totalDocs,
    currentPage: page,
  }
}

export async function getAllCategories(locale: Locale) {
  const payload = await getPayload({ config: configPromise })

  // Use the categories collection directly with the category type filter
  const categories = await payload.find({
    collection: 'categories',
    where: {
      categoryType: {
        equals: 'product',
      },
    },
    locale,
  })

  return categories
}
