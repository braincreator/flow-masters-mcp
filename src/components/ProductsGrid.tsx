'use client'

import React from 'react'
import type { Product } from '@/payload-types'
import { type Locale } from '@/constants'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from './Pagination'

interface ProductsGridProps {
  products: Product[]
  layout?: 'grid' | 'list'
  currentPage: number
  totalPages: number
  locale: Locale
  onAddToCart?: (product: Product) => void
}

export function ProductsGrid({ 
  products, 
  layout = 'grid',
  currentPage,
  totalPages,
  locale,
  onAddToCart
}: ProductsGridProps) {
  return (
    <div className="space-y-8">
      <div className={layout === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-6"
      }>
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/${locale}/products`}
      />
    </div>
  )
}
