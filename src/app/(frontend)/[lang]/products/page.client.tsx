'use client'

import { FilterBar } from '@/components/FilterBar'
import { ProductsGrid } from '@/components/ProductsGrid'
import { type Locale } from '@/constants'
import type { Category, Product } from '@/payload-types'

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
  // Ensure products and categories are arrays
  const productsList = Array.isArray(products) ? products : []
  const categoriesList = Array.isArray(categories) ? categories : []

  return (
    <div>
      <FilterBar
        categories={categoriesList}
        currentCategory={searchParams.category}
        currentSearch={searchParams.search}
        currentSort={searchParams.sort}
        layout={searchParams.layout || 'grid'}
        labels={{
          categories: currentLocale === 'ru' ? 'Категории' : 'Categories',
          sort: currentLocale === 'ru' ? 'Сортировка' : 'Sort',
          search: currentLocale === 'ru' ? 'Поиск' : 'Search',
          searchPlaceholder: currentLocale === 'ru' ? 'Поиск продуктов...' : 'Search products...',
          allCategories: currentLocale === 'ru' ? 'Все категории' : 'All categories',
          layout: {
            grid: currentLocale === 'ru' ? 'Сетка' : 'Grid',
            list: currentLocale === 'ru' ? 'Список' : 'List'
          }
        }}
        sortOptions={[
          { label: currentLocale === 'ru' ? 'Новые' : 'Newest', value: 'newest' },
          { label: currentLocale === 'ru' ? 'Старые' : 'Oldest', value: 'oldest' },
          { label: currentLocale === 'ru' ? 'По названию' : 'By title', value: 'title' },
          { label: currentLocale === 'ru' ? 'Цена (выс-низ)' : 'Price (high-low)', value: 'price' },
          { label: currentLocale === 'ru' ? 'Цена (низ-выс)' : 'Price (low-high)', value: 'price-asc' }
        ]}
      />

      {productsList.length > 0 ? (
        <ProductsGrid
          products={productsList}
          layout={searchParams.layout || 'grid'}
          currentPage={currentPage}
          totalPages={totalPages}
          locale={currentLocale}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {currentLocale === 'ru' ? 'Продукты не найдены' : 'No products found'}
          </p>
        </div>
      )}
    </div>
  )
}
