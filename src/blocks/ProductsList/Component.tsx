'use client'

import React from 'react'
import { FilterBar } from '@/components/FilterBar'
import { ProductsGrid } from '@/components/ProductsGrid'
import { useRouter, useSearchParams } from 'next/navigation'
import { type Product } from '@/payload-types'
import { useI18n } from '@/providers/I18n'
import { translations } from '@/app/(frontend)/[lang]/products/translations'
import LoadingIndicator from '@/components/ui/LoadingIndicator'
import { useState, useEffect } from 'react'

interface ProductsListProps {
  heading?: string
  subheading?: string
  enableFiltering?: boolean
  products?: Product[]
  limit?: number
  layout?: 'grid' | 'list'
}

export const ProductsList: React.FC<ProductsListProps> = ({
  heading,
  subheading,
  enableFiltering = true,
  products: initialProducts = [],
  limit = 12,
  layout: defaultLayout = 'grid',
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useI18n()
  const t = translations[lang as keyof typeof translations]

  const [displayProducts, setDisplayProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const layout = searchParams.get('layout') || defaultLayout

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const queryString = searchParams.toString()
      const apiUrl = `/api/v1/products?${queryString}&locale=${lang}&limit=${limit}`

      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      setDisplayProducts(data.docs || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(data.page || 1)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (enableFiltering) {
      fetchProducts()
    }
  }, [searchParams])

  return (
    <div className="w-full space-y-8">
      {(heading || subheading) && (
        <div className="text-center space-y-2">
          {heading && <h2 className="text-3xl font-bold">{heading}</h2>}
          {subheading && <p className="text-muted-foreground">{subheading}</p>}
        </div>
      )}

      {enableFiltering && (
        <FilterBar
          categories={[]}
          sortOptions={[
            { label: t.sortOptions.newest, value: 'newest' },
            { label: t.sortOptions.priceLowToHigh, value: 'price-asc' },
            { label: t.sortOptions.priceHighToLow, value: 'price' },
          ]}
          defaultLayout={layout}
          locale={lang}
          labels={{
            categories: t.filters.categories,
            sort: t.filters.sort,
            search: t.filters.search,
            searchPlaceholder: t.filters.searchPlaceholder,
            allCategories: t.categories.all,
            productTypes: t.filters.productTypes,
            priceRange: t.filters.priceRange,
            layout: t.filters.layout,
          }}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center my-12">
          <LoadingIndicator size="lg" />
        </div>
      ) : (
        <ProductsGrid
          products={displayProducts}
          layout={layout}
          locale={lang}
          currentPage={currentPage}
          totalPages={totalPages}
          labels={{
            prev: t.pagination.prev,
            next: t.pagination.next,
            page: t.pagination.page,
            of: t.pagination.of,
          }}
        />
      )}
    </div>
  )
}
