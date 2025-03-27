import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload'
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

export default async function StorePage({ params, searchParams }: Props) {
  const { lang } = await params
  const searchParamsResolved = await searchParams
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  try {
    const payload = await getPayloadClient()

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
      where.category = { equals: searchParamsResolved.category }
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

    const [products, categories] = await Promise.all([
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
        collection: 'categories',
        locale: currentLocale,
        limit: 100,
      }),
    ])

    if (!products?.docs || !categories?.docs) {
      console.error('Invalid response format from Payload')
      return notFound()
    }

    const productDocs = products.docs.map((doc) => ({
      ...doc,
      id: doc.id?.toString(),
      title: typeof doc.title === 'string' ? doc.title : doc.title?.[currentLocale] || '',
      description: doc.description || null,
    }))

    const categoryDocs = categories.docs.map((doc) => ({
      ...doc,
      id: doc.id?.toString(),
      name: typeof doc.name === 'string' ? doc.name : doc.name?.[currentLocale] || '',
    }))

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
            categories={categoryDocs}
            currentLocale={currentLocale}
            searchParams={searchParamsResolved}
            totalPages={products.totalPages || 1}
            currentPage={currentPage}
          />
        </div>
      </div>
    )
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
