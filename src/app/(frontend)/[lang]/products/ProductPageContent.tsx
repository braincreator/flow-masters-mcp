'use client'

import React from 'react'
import { ProductsGrid } from '@/blocks/ProductsGrid/Component'
import { FilterBar } from '@/components/FilterBar'
import LoadingIndicator from '@/components/ui/LoadingIndicator'
import { useState, useEffect } from 'react'
import { DEFAULT_LOCALE } from '@/constants'
import type { ProductType } from '@/payload-types'

interface SearchParams {
  search?: string
  category?: string
  sort?: string
  layout?: 'grid' | 'list'
  page?: string
  minPrice?: number
  maxPrice?: number
}

interface ProductPageContentProps {
  lang: string
  searchParams: SearchParams
  t: any
  payload: any
}

const ProductPageContent: React.FC<ProductPageContentProps> = ({ 
  lang, 
  searchParams, 
  t, 
  payload 
}) => {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<{
    docs: ProductType[]
    totalDocs: number
    totalPages: number
    page: number
  } | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      if (!isMounted) return
      
      setLoading(true)
      try {
        const where: Record<string, any> = {
          status: {
            equals: 'published',
          },
        }

        // Add search condition
        if (searchParams?.search) {
          where.or = [
            {
              title: {
                contains: searchParams.search,
              },
            },
            {
              description: {
                contains: searchParams.search,
              },
            },
          ]
        }

        // Add category filter
        if (searchParams?.category && searchParams.category !== 'all') {
          where.category = {
            equals: searchParams.category,
          }
        }

        // Add price range
        if (searchParams?.minPrice || searchParams?.maxPrice) {
          where.price = {
            ...(searchParams.minPrice !== undefined && { 
              greater_than_equal: searchParams.minPrice 
            }),
            ...(searchParams.maxPrice !== undefined && { 
              less_than_equal: searchParams.maxPrice 
            }),
          }
        }

        const result = await payload.find({
          collection: 'products',
          where,
          locale: lang || DEFAULT_LOCALE,
          depth: 1,
          page: parseInt(searchParams?.page || '1'),
          limit: 12,
          sort: searchParams?.sort ? { [searchParams.sort]: -1 } : { createdAt: -1 },
        })
        
        if (isMounted) {
          setProducts(result)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [searchParams, lang, payload])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t.pageTitle}</h1>
          <p className="text-lg text-muted-foreground">{t.pageDescription}</p>
        </div>

        <FilterBar
          categories={[]}  // Pass actual categories if needed
          sortOptions={[]}  // Pass actual sort options if needed
          defaultLayout={searchParams?.layout || 'grid'}
          currentSearch={searchParams?.search}
          currentCategory={searchParams?.category}
          currentSort={searchParams?.sort}
          labels={{
            categories: t.filters.categories,
            sort: t.filters.sort,
            search: t.filters.search,
            searchPlaceholder: t.filters.searchPlaceholder,
            allCategories: t.categories.all,
            layout: t.filters.layout,
          }}
        />

        <div className="mt-8">
          {loading ? (
            <LoadingIndicator className="my-8" />
          ) : products?.docs?.length > 0 ? (
            <ProductsGrid
              products={products.docs}
              currentPage={products.page}
              totalPages={products.totalPages}
              layout={searchParams?.layout || 'grid'}
              labels={{
                prev: t.pagination.prev,
                next: t.pagination.next,
                page: t.pagination.page,
                of: t.pagination.of,
              }}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">{t.noResults}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPageContent
