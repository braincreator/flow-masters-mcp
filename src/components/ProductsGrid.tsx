'use client'

import React, { useState, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { Product } from '@/payload-types'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from './Pagination'
import type { ProductQueryOptions } from '@/types/product.service'

interface ProductsGridProps {
  layout?: 'grid' | 'list'
  locale: string
  products: Product[]
  currentPage: number
  totalPages: number
  onAddToCart?: (product: Product) => void
  labels?: {
    prev: string
    next: string
    page: string
    of: string
  }
}

export function ProductsGrid({
  layout = 'grid',
  locale,
  products,
  currentPage,
  totalPages,
  onAddToCart,
  labels,
}: ProductsGridProps) {
  // We now keep a filters state that will be sent to the product service.
  const [filters, setFilters] = useState<ProductQueryOptions>({
    categories: [],
    priceRange: { min: 0, max: 0 },
    sort: '',
    search: '',
    page: currentPage,
  })

  // We use a debounce so that rapid changes (like typing in the search field) don't trigger too many API calls.
  const debouncedSearch = useDebounce(filters.search, 300)

  // Handler used by Pagination (if applicable) to change pages.
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }))
  }, [])

  return (
    <div className="w-full">
      <div className="space-y-8 flex flex-col min-h-[calc(100vh-200px)]">
        <div
          className={
            layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-6'
          }
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              layout={layout}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        <div className="mt-auto">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            labels={labels}
          />
        </div>
      </div>
    </div>
  )
}
