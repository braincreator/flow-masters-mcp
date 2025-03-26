'use client'

import { FilterBar } from '@/components/FilterBar'
import { ProductsGrid } from '@/components/ProductsGrid'
import { type Locale } from '@/constants'
import type { Category, Product } from '@/payload-types'
import { translations } from './translations'

interface ProductsClientProps {
  products: Product[]
  categories: Category[]
  currentLocale: Locale
  searchParams: {
    category?: string
    search?: string
    sort?: string
    layout?: 'grid' | 'list'
    page?: string
  }
  totalPages: number
  currentPage: number
}

export default function ProductsClient({
  products,
  categories,
  currentLocale,
  searchParams,
  totalPages,
  currentPage,
}: ProductsClientProps) {
  const t = translations[currentLocale as keyof typeof translations]

  const categoriesList = categories.map((category) => ({
    id: category.id,
    label: typeof category.title === 'object' ? category.title[currentLocale] : category.title,
    value: category.id,
  }))

  const productTypes = [
    { id: 'digital', label: t.filters.productType.digital, value: 'digital' },
    { id: 'subscription', label: t.filters.productType.subscription, value: 'subscription' },
    { id: 'service', label: t.filters.productType.service, value: 'service' },
    { id: 'access', label: t.filters.productType.access, value: 'access' },
  ]

  const tags = [
    { id: 'new', label: 'New', value: 'new' },
    { id: 'popular', label: 'Popular', value: 'popular' },
    { id: 'featured', label: 'Featured', value: 'featured' },
  ]

  const priceRange = { min: 0, max: 1000 }

  return (
    <div>
      <FilterBar
        categories={categoriesList}
        sortOptions={[
          { label: t.sortOptions.newest, value: 'newest' },
          { label: t.sortOptions.priceLowToHigh, value: 'price-asc' },
          { label: t.sortOptions.priceHighToLow, value: 'price' },
        ]}
        productTypes={productTypes}
        tags={tags}
        priceRange={priceRange}
        defaultLayout={searchParams.layout || 'grid'}
        locale={currentLocale}
        labels={{
          categories: t.filters.categories,
          sort: t.filters.sort,
          search: t.filters.search,
          searchPlaceholder: t.filters.searchPlaceholder,
          allCategories: t.categories.all,
          productTypes: t.filters.productTypes,
          tags: t.filters.tags,
          priceRange: t.filters.priceRange,
          layout: t.filters.layout,
        }}
      />
      <ProductsGrid
        products={products}
        layout={searchParams.layout || 'grid'}
        locale={currentLocale}
        currentPage={currentPage}
        totalPages={totalPages}
        labels={{
          prev: t.pagination.prev,
          next: t.pagination.next,
          page: t.pagination.page,
          of: t.pagination.of,
        }}
      />
    </div>
  )
}
