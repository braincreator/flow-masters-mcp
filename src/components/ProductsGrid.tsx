'use client'

import React, { useState, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { Product } from '@/payload-types'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from './Pagination'
import type { ProductQueryOptions } from '@/types/product.service'
import { cn } from '@/utilities/ui'
import PaginationRenderer from '@/components/PaginationRenderer'

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
  className?: string
}

export function ProductsGrid({
  layout = 'grid',
  locale,
  products,
  currentPage = 1,
  totalPages = 1,
  onAddToCart,
  labels,
  className,
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

  // Empty state
  if (products.length === 0) {
    return (
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl mt-4">
        <h3 className="text-xl font-semibold mb-2">
          {locale === 'ru' ? 'Продукты не найдены' : 'No products found'}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {locale === 'ru'
            ? 'Попробуйте изменить параметры поиска или фильтры'
            : 'Try changing your search or filter parameters'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className={cn('space-y-8 flex flex-col', layout === 'list' && 'w-full')}>
        {layout === 'list' ? (
          <div className="w-full space-y-4">
            {products.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard
                  product={product}
                  locale={locale}
                  layout={layout}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
              className,
            )}
          >
            {products.map((product) => (
              <div key={product.id} className="h-auto">
                <ProductCard
                  product={product}
                  locale={locale}
                  layout={layout}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <PaginationRenderer>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              labels={labels}
            />
          </PaginationRenderer>
        )}
      </div>
    </div>
  )
}
