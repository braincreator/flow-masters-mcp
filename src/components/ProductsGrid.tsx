import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ProductType } from '@/payload-types'
import { getLocalePrice } from '@/utilities/formatPrice'
import { Pagination } from './Pagination'
import RichText from '@/components/RichText'
import { type Locale } from '@/constants'

interface ProductsGridProps {
  products: ProductType[]
  layout?: 'grid' | 'list'
  currentPage: number
  totalPages: number
  locale: Locale
}

export function ProductsGrid({ 
  products, 
  layout = 'grid',
  currentPage,
  totalPages,
  locale
}: ProductsGridProps) {
  return (
    <div className="space-y-8">
      <div className={layout === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-6"
      }>
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-card rounded-lg shadow-sm overflow-hidden border border-border
              ${layout === 'list' ? 'flex gap-6' : ''}
            `}
          >
            {product.featuredImage && (
              <Link 
                href={`/${locale}/products/${product.slug}`}
                className={layout === 'list' ? 'w-48 h-48 shrink-0' : 'w-full aspect-[4/3]'}
              >
                <img
                  src={product.featuredImage.url}
                  alt={product.featuredImage.alt || product.title}
                  className="w-full h-full object-cover"
                />
              </Link>
            )}
            
            <div className="p-4">
              <Link 
                href={`/${locale}/products/${product.slug}`}
                className="hover:underline"
              >
                <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              </Link>
              
              {product.description && (
                <div className="prose prose-sm dark:prose-invert line-clamp-3 mb-4">
                  <RichText data={product.description} />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-primary">
                  ${product.price}
                </div>
                <Link
                  href={`/${locale}/products/${product.slug}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                >
                  {locale === 'ru' ? 'Подробнее' : 'View Details'}
                </Link>
              </div>
            </div>
          </div>
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
