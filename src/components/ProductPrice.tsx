'use client'

import React, { useState, useEffect } from 'react'
import { formatPrice, formatItemPrice, getLocalePrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'
import { Product } from '@/payload-types'
import { cn } from '@/utilities/ui'

interface ProductPriceProps {
  product: Product
  locale: Locale
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showCompareAt?: boolean
}

export default function ProductPrice({
  product,
  locale,
  className = '',
  size = 'md',
  showCompareAt = true,
}: ProductPriceProps) {
  const [formattedPrice, setFormattedPrice] = useState<string>('')
  const [formattedCompareAtPrice, setFormattedCompareAtPrice] = useState<string | null>(null)
  const [hasDiscount, setHasDiscount] = useState<boolean>(false)

  useEffect(() => {
    if (!product || !product.pricing) return

    // Используем новую функцию форматирования с поддержкой префикса "от"
    const isPriceStartingFrom = product.pricing.isPriceStartingFrom

    // Получаем локализованную цену или финальную цену
    const mainPrice = getLocalePrice(product, locale)
    setFormattedPrice(formatPrice(mainPrice, locale, isPriceStartingFrom))

    // Проверяем наличие сравнительной цены
    const compareAtPrice = product.pricing.compareAtPrice || 0

    if (compareAtPrice > 0 && compareAtPrice > mainPrice) {
      setFormattedCompareAtPrice(formatPrice(compareAtPrice, locale))
      setHasDiscount(true)
    } else {
      setFormattedCompareAtPrice(null)
      setHasDiscount(false)
    }
  }, [product, locale])

  // Классы в зависимости от размера
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  if (!product || !product.pricing) {
    return null
  }

  return (
    <div className={cn('flex items-center flex-wrap gap-2', className)}>
      <span className={cn('font-semibold', sizeClasses[size], hasDiscount && 'text-primary')}>
        {formattedPrice}
      </span>

      {hasDiscount && showCompareAt && formattedCompareAtPrice && (
        <span
          className={cn(
            'line-through text-muted-foreground',
            size === 'lg' ? 'text-base' : 'text-sm',
          )}
        >
          {formattedCompareAtPrice}
        </span>
      )}

      {hasDiscount && product.pricing.discountPercentage && (
        <span
          className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 
                        text-xs px-2 py-0.5 rounded-full ml-2"
        >
          -{Math.round(product.pricing.discountPercentage)}%
        </span>
      )}
    </div>
  )
}
