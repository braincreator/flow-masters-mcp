'use client'

import React from 'react'
import { formatPrice, getLocalePrice, convertPrice } from '@/utilities/formatPrice'
import { type Locale } from '@/constants'
import { DiscountBadge } from '@/components/ui/badges'
import { cn } from '@/utilities/ui'
import { type Product } from '@/payload-types'

// Добавляем интерфейс для пропсов
interface ProductPriceProps {
  product: Product
  locale: Locale
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'card' | 'detail'
  showDiscountBadge?: boolean
  showPaymentOptions?: boolean
  className?: string
  priceClassName?: string
  compareClassName?: string
  discountClassName?: string
  paymentOptionsText?: string
}

export function ProductPrice({
  product,
  locale,
  size = 'md',
  variant = 'default',
  showDiscountBadge = true,
  showPaymentOptions = false,
  className,
  priceClassName,
  compareClassName,
  discountClassName,
  paymentOptionsText,
}: ProductPriceProps) {
  // Получаем КОНВЕРТИРОВАННЫЕ числовые значения цен с помощью getLocalePrice
  const convertedFinalPrice = getLocalePrice(product, locale)

  // Для compareAtPrice нужна отдельная логика, т.к. getLocalePrice не обрабатывает его.
  // Берем базовый compareAtPrice или basePrice, затем конвертируем, если нужно.
  let baseCompareAtPrice = product?.pricing?.compareAtPrice ?? null
  // Если compareAtPrice не задан, но есть скидка, пробуем использовать basePrice как compareAtPrice
  const hasDiscountPercentage =
    product?.pricing?.discountPercentage && product.pricing.discountPercentage > 0
  if (baseCompareAtPrice === null && hasDiscountPercentage && product?.pricing?.basePrice) {
    baseCompareAtPrice = product.pricing.basePrice
  }

  let convertedCompareAtPrice: number | null = null
  if (baseCompareAtPrice !== null) {
    const baseLocale = /* product?.pricing?.baseLocale || */ 'en' // Предполагаем, что compareAtPrice в базовой локали
    if (baseLocale !== locale) {
      convertedCompareAtPrice = convertPrice(baseCompareAtPrice, baseLocale, locale)
    } else {
      convertedCompareAtPrice = baseCompareAtPrice
    }
    if (convertedCompareAtPrice !== null && convertedCompareAtPrice <= convertedFinalPrice) {
      convertedCompareAtPrice = null
    }
  }

  const hasDiscount = convertedCompareAtPrice !== null
  let discountPercentage = product?.pricing?.discountPercentage ?? null

  // --- Debugging Logs Start ---
  console.log('--- ProductPrice Debug (Updated) ---')
  console.log('Locale:', locale)
  console.log('Product Pricing Prop:', product?.pricing)
  console.log('Converted Final Price:', convertedFinalPrice)
  console.log('Base Compare At Price:', baseCompareAtPrice)
  console.log('Converted Compare At Price:', convertedCompareAtPrice)
  console.log('Has Discount:', hasDiscount)
  console.log('--- End ProductPrice Debug ---')
  // --- Debugging Logs End ---

  // Если finalPrice не определен (или 0 после конвертации?), возвращаем null
  if (convertedFinalPrice === undefined || convertedFinalPrice === null) {
    // Возможно, стоит проверить и на 0, если цена 0 не должна отображаться
    return null
  }

  const sizeClasses = {
    price: {
      sm: 'text-base font-semibold',
      md: 'text-xl font-bold',
      lg: 'text-3xl font-bold',
    },
    compare: {
      sm: 'text-xs text-muted-foreground line-through opacity-80',
      md: 'text-sm text-muted-foreground line-through opacity-80',
      lg: 'text-xl text-muted-foreground line-through opacity-80',
    },
    discount: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  }

  const variantClasses = {
    container: {
      default: 'flex flex-wrap items-center gap-2',
      card: 'flex flex-col items-end',
      detail: 'flex flex-wrap items-center gap-3',
    },
  }

  const defaultPaymentOptionsText =
    locale === 'ru' ? 'Доступны варианты оплаты' : 'Payment options available'

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(variantClasses.container[variant])}>
        <span className={cn(sizeClasses.price[size], priceClassName)}>
          {/* Форматируем УЖЕ КОНВЕРТИРОВАННУЮ цену */}
          {formatPrice(convertedFinalPrice, locale)}
        </span>

        {/* Используем конвертированную compareAtPrice */}
        {hasDiscount && convertedCompareAtPrice && (
          <span className={cn(sizeClasses.compare[size], compareClassName)}>
            {formatPrice(convertedCompareAtPrice, locale)}
          </span>
        )}

        {showDiscountBadge && hasDiscount && discountPercentage && discountPercentage > 0 && (
          <DiscountBadge
            percentage={discountPercentage}
            className={cn(sizeClasses.discount[size], discountClassName)}
          />
        )}
      </div>

      {showPaymentOptions && (
        <div className="text-sm text-muted-foreground">
          {paymentOptionsText || defaultPaymentOptionsText}
        </div>
      )}
    </div>
  )
}
