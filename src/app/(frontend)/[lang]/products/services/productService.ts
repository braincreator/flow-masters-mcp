import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Locale } from '@/constants'

interface ProductQueryParams {
  category?: string
  search?: string
  sort?: string
  page?: string
  locale: Locale
}

export async function getProducts({
  category,
  search,
  sort: sortParam,
  page: pageParam,
  locale
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

  let sort = '-createdAt'
  if (sortParam) {
    switch (sortParam) {
      case 'price-low':
        sort = 'price'
        break
      case 'price-high':
        sort = '-price'
        break
    }
  }

  const page = parseInt(pageParam || '1', 10)
  const limit = 12

  return payload.find({
    collection: 'products',
    where,
    sort,
    page,
    limit,
    locale,
    depth: 1,
  })
}

export async function getAllCategories(locale: Locale) {
  const payload = await getPayload({ config: configPromise })
  
  return payload.find({
    collection: 'products',
    where: {
      status: {
        equals: 'published',
      },
    },
    locale,
  })
}