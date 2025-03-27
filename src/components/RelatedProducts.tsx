'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/payload-types'
import { ProductCard } from '@/components/ProductCard/index'
import { useTranslations } from '@/hooks/useTranslations'
import { Locale } from '@/constants'

interface RelatedProductsProps {
  product: Product
  lang: string
}

export function RelatedProducts({ product, lang }: RelatedProductsProps) {
  const t = useTranslations(lang)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoading(true)
      try {
        // Use browser fetch API instead of the service directly
        const response = await fetch(`/api/products/related?id=${product.id}&limit=4`)
        if (!response.ok) {
          throw new Error('Failed to fetch related products')
        }
        const products = await response.json()
        setRelatedProducts(products)
      } catch (error) {
        console.error('Error fetching related products:', error)
        setRelatedProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [product.id])

  const handleAddToCart = (product: Product) => {
    // Here you would add logic to add the product to cart
    console.log('Adding to cart:', product.title)
  }

  if (isLoading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">
          {t.products?.relatedProducts || 'You may also like'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden border p-4">
              <div className="w-full aspect-[4/3] bg-muted/40 animate-pulse rounded"></div>
              <div className="mt-4 space-y-3">
                <div className="h-5 w-2/3 bg-muted/40 animate-pulse rounded"></div>
                <div className="h-4 w-1/2 bg-muted/40 animate-pulse rounded"></div>
                <div className="h-6 w-1/3 bg-muted/40 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">
        {t.products?.relatedProducts || 'You may also like'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard
            key={relatedProduct.id}
            product={relatedProduct}
            locale={lang as Locale}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  )
}
