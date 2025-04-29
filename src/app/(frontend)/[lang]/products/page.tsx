import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload/index'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import ProductsClient from './page.client'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

const ITEMS_PER_PAGE = 12

interface Props {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
    page?: string
    layout?: 'grid' | 'list'
    favorites?: string
  }>
}

// Helper function to safely serialize objects with potential Buffer fields
function safeSerialize(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Buffer.isBuffer(obj)) {
    return obj.toString('base64')
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map((item) => safeSerialize(item))
    }

    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      // Skip fields that could cause serialization issues
      if (key !== 'buffer' && key !== '_id' && typeof value !== 'function') {
        result[key] = safeSerialize(value)
      }
    }
    return result
  }

  return obj
}

export default async function StorePage({ params, searchParams }: Props) {
  const { lang } = await params
  const searchParamsResolved = await searchParams
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  try {
    const payload = await getPayloadClient()

    // Check if products collection exists
    const collections = Object.keys(payload.collections)
    if (!collections.includes('products')) {
      console.error('Products collection not found. Available collections:', collections)
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {currentLocale === 'ru' ? 'Продукты' : 'Products'}
              </h1>
              <div
                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded"
                role="alert"
              >
                <p className="font-bold">{currentLocale === 'ru' ? 'Внимание' : 'Warning'}</p>
                <p>
                  {currentLocale === 'ru'
                    ? 'Коллекция продуктов временно недоступна. Пожалуйста, повторите попытку позже.'
                    : 'Products collection is temporarily unavailable. Please try again later.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const where: Record<string, any> = {
      _status: { equals: 'published' },
    }

    if (searchParamsResolved.search) {
      where.or = [
        { [`title.${currentLocale}`]: { contains: searchParamsResolved.search } },
        { [`description.${currentLocale}`]: { contains: searchParamsResolved.search } },
      ]
    }

    if (searchParamsResolved.category && searchParamsResolved.category !== 'all') {
      where.productCategory = { equals: searchParamsResolved.category }
    }

    // Фильтрация по избранным товарам будет реализована на клиентской стороне
    // так как список избранных хранится в localStorage

    let sort: string = '-createdAt'

    switch (searchParamsResolved.sort) {
      case 'price':
        sort = `-pricing.${currentLocale}.amount`
        break
      case 'price-asc':
        sort = `pricing.${currentLocale}.amount`
        break
      case 'title':
        sort = `title.${currentLocale}`
        break
      case 'oldest':
        sort = 'createdAt'
        break
      case 'newest':
        sort = '-createdAt'
        break
    }

    const currentPage = Math.max(1, parseInt(searchParamsResolved.page || '1'))

    try {
      const [products, productCategories] = await Promise.all([
        payload.find({
          collection: 'products',
          where,
          locale: currentLocale,
          depth: 1,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort,
        }),
        payload.find({
          collection: 'productCategories',
          locale: currentLocale,
          limit: 100,
          depth: 0,
        }),
      ])

      if (!products?.docs || !productCategories?.docs) {
        console.error('Invalid response format from Payload for products or productCategories')
        return notFound()
      }

      const productDocs = products.docs.map((doc) => {
        const plainDoc = safeSerialize(doc)
        return {
          ...plainDoc,
          id: doc.id?.toString(),
          title: typeof doc.title === 'string' ? doc.title : doc.title?.[currentLocale] || '',
          description: doc.description ? safeSerialize(doc.description) : null,
          productCategory:
            typeof doc.productCategory === 'string'
              ? doc.productCategory
              : safeSerialize(doc.productCategory),
        }
      })

      const productCategoryDocs = productCategories.docs.map((doc) => {
        const plainDoc = safeSerialize(doc)
        return {
          ...plainDoc,
          id: doc.id?.toString(),
          title: typeof doc.title === 'string' ? doc.title : doc.title?.[currentLocale] || '',
        }
      })

      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {currentLocale === 'ru' ? 'Продукты' : 'Products'}
              </h1>
            </div>

            <ProductsClient
              products={productDocs}
              categories={productCategoryDocs}
              currentLocale={currentLocale}
              searchParams={searchParamsResolved}
              totalPages={products.totalPages || 1}
              currentPage={currentPage}
            />
          </div>
        </div>
      )
    } catch (findError) {
      console.error('Error executing find operation:', findError)
      throw findError
    }
  } catch (error) {
    console.error('Error loading products:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    return notFound()
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  return {
    title: currentLocale === 'ru' ? 'Продукты | Flow Masters' : 'Products | Flow Masters',
    description:
      currentLocale === 'ru'
        ? 'Исследуйте нашу коллекцию продуктов автоматизации'
        : 'Explore our collection of automation products',
  }
}
