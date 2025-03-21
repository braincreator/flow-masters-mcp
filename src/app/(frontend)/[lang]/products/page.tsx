import { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ProductsGrid } from '@/blocks/ProductsGrid/Component'
import { FilterBar } from '@/components/FilterBar'
import { DEFAULT_LOCALE } from '@/constants'

type Props = {
  params: {
    lang: string
  }
  searchParams?: {
    category?: string
    search?: string
    sort?: string
    page?: string
    layout?: 'grid' | 'list'
  }
}

export default async function StorePage({ params: { lang }, searchParams }: Props) {
  const payload = await getPayload({ config: configPromise })
  
  const products = await payload.find({
    collection: 'products',
    where: {
      status: {
        equals: 'published',
      },
    },
    locale: lang || DEFAULT_LOCALE,
    depth: 1, // To populate thumbnail and other relationships
  })

  // Get unique categories for filter
  const categories = [...new Set(products.docs.map(product => product.category))]
    .map(category => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value: category,
    }))

  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Digital Products Store
          </h1>
          <p className="text-lg text-gray-600">
            Discover our collection of N8N workflows, Make.com automations, tutorials, and courses
          </p>
        </div>

        <FilterBar
          categories={categories}
          sortOptions={sortOptions}
          defaultLayout="grid"
        />

        <div className="mt-8">
          <ProductsGrid
            products={products.docs}
            productsPerPage={12}
            showPagination={true}
            layout={searchParams?.layout || 'grid'}
          />
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params: { lang } }: Props): Promise<Metadata> {
  return {
    title: 'Digital Store - AI Automation Solutions',
    description: 'Purchase N8N workflows, Make.com automations, tutorials, and courses',
    openGraph: {
      title: 'Digital Store - AI Automation Solutions',
      description: 'Purchase N8N workflows, Make.com automations, tutorials, and courses',
      type: 'website',
    },
  }
}

// Generate static params for all supported languages
export async function generateStaticParams() {
  // You might want to fetch this from your language configuration
  const languages = ['en', 'ru']
  
  return languages.map((lang) => ({
    lang,
  }))
}
