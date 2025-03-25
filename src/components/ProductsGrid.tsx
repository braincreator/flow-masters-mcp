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
            className={`group bg-card rounded-xl border border-border overflow-hidden
              transition-all duration-300 hover:shadow-lg
              ${layout === 'list' ? 'flex gap-6' : 'flex flex-col'}
            `}
          >
            {/* Image Container */}
            <Link 
              href={`/${locale}/products/${product.slug}`}
              className={`
                relative overflow-hidden
                ${layout === 'list' ? 'w-48 h-48 shrink-0' : 'w-full aspect-[4/3]'}
              `}
            >
              {product.featuredImage ? (
                <img
                  src={product.featuredImage.url}
                  alt={product.featuredImage.alt || product.title}
                  className="w-full h-full object-cover transition-transform duration-300 
                           group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              
              {/* Price Badge */}
              {product.pricing?.[locale]?.amount && (
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm 
                              px-3 py-1 rounded-full border border-border">
                  <span className="font-semibold">
                    {formatPrice(product.pricing[locale].amount, locale)}
                  </span>
                </div>
              )}
            </Link>
            
            {/* Content Container */}
            <div className="flex flex-col flex-grow p-4 space-y-4">
              {/* Title */}
              <Link 
                href={`/${locale}/products/${product.slug}`}
                className="group-hover:text-primary transition-colors"
              >
                <h2 className="text-xl font-semibold line-clamp-2">
                  {typeof product.title === 'object' ? product.title[locale] : product.title}
                </h2>
              </Link>
              
              {/* Description */}
              {product.description && (
                <p className="line-clamp-3 text-muted-foreground">
                  {typeof product.description === 'object' 
                    ? product.description[locale] 
                    : product.description}
                </p>
              )}
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 mt-auto border-t border-border">
                {/* Categories */}
                {product.categories && product.categories.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {product.categories.map((category, index) => (
                      <React.Fragment key={category.id}>
                        <span>
                          {typeof category.title === 'object' 
                            ? category.title[locale] 
                            : category.title}
                        </span>
                        {index < product.categories.length - 1 && <span>•</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
                
                {/* Action Button */}
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium
                           transition-colors focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring disabled:pointer-events-none
                           bg-primary text-primary-foreground hover:bg-primary/90
                           h-9 px-4 py-2"
                  onClick={() => {/* Add to cart logic */}}
                >
                  {locale === 'ru' ? 'В корзину' : 'Add to Cart'}
                </button>
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
