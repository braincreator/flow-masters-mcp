'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/payload-types'
import { ProductCard } from '@/components/ProductCard/index'
import { useTranslations } from 'next-intl'
import { Locale } from '@/constants'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Определяем EnhancedProduct для совместимости с ProductCard
interface EnhancedProduct extends Product {
  productType: 'physical' | 'digital' | 'subscription' | 'service' | 'access'
  isBestseller?: boolean
  hasFreeDelivery?: boolean
  featuredImage?: {
    url: string
    alt?: string
  }
}

interface RelatedProductsProps {
  product: Product
  lang: string
}

export function RelatedProducts({ product, lang }: RelatedProductsProps) {
  const t = useTranslations('products')
  const [relatedProducts, setRelatedProducts] = useState<EnhancedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasProducts, setHasProducts] = useState(false)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoading(true)
      try {
        // Use browser fetch API instead of the service directly
        const response = await fetch(`/api/v1/products/related?id=${product.id}&limit=4`)
        if (!response.ok) {
          throw new Error('Failed to fetch related products')
        }
        const products = await response.json()

        // Добавляем недостающие поля для совместимости с EnhancedProduct
        const enhancedProducts = products.map((prod: any) => ({
          ...prod,
          productType: prod.productType || 'physical',
          isBestseller: prod.isBestseller || false,
          hasFreeDelivery: prod.hasFreeDelivery || false,
        })) as EnhancedProduct[]

        setRelatedProducts(enhancedProducts)
        setHasProducts(enhancedProducts.length > 0)
      } catch (error) {
        logError('Error fetching related products:', error)
        setRelatedProducts([])
        setHasProducts(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [product.id])

  const handleAddToCart = (product: EnhancedProduct) => {
    // Here you would add logic to add the product to cart
    logDebug('Adding to cart:', product.title)
  }

  // Не отображаем ничего во время загрузки или если нет товаров
  if (isLoading || !hasProducts) {
    return null
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">{t('relatedProducts')}</h2>
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
