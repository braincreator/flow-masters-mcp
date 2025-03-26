import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE } from '@/constants'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const locale = searchParams.get('locale') || DEFAULT_LOCALE
    const search = searchParams.get('search') || ''
    const categories = searchParams.get('categories')?.split(',') || []
    const sort = searchParams.get('sort') || ''
    const priceRange = searchParams.get('priceRange')
      ? JSON.parse(searchParams.get('priceRange')!)
      : { min: 0, max: 0 }

    const payload = await getPayloadClient()

    const where: any = {}
    if (search) {
      where.title = { like: search }
    }
    if (categories.length > 0) {
      where.category = { in: categories }
    }
    if (priceRange.min > 0 || priceRange.max > 0) {
      where.price = {}
      if (priceRange.min > 0) where.price.greater_than_equal = priceRange.min
      if (priceRange.max > 0) where.price.less_than_equal = priceRange.max
    }

    const result = await payload.find({
      collection: 'products',
      where,
      page,
      limit,
      locale,
      sort: sort || '-createdAt',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
