'use client'

import React from 'react'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'
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
  // Get the final price for the current locale
  const finalPrice = getLocalePrice(product, locale)

  // Get compare at price if available (localized)
  let compareAtPrice: number | null = null
  if (product?.pricing?.compareAtPrice) {
    // Check if compareAtPrice is localized
    if (typeof product.pricing.compareAtPrice === 'object') {
      compareAtPrice = product.pricing.compareAtPrice[locale] || product.pricing.compareAtPrice.en || null
    } else {
      compareAtPrice = product.pricing.compareAtPrice
    }

    // Only show compare price if it's higher than final price
    if (compareAtPrice && compareAtPrice <= finalPrice) {
      compareAtPrice = null
    }
  }

  const hasDiscount = compareAtPrice !== null && compareAtPrice > finalPrice
  const discountPercentage = product?.pricing?.discountPercentage ?? null

  // If finalPrice is not defined, return null
  if (finalPrice === undefined || finalPrice === null || finalPrice === 0) {
    return null
  }

  const sizeClasses = {
    price: {
      sm: 'text-base font-semibold text-foreground',
      md: 'text-xl font-bold text-foreground',
      lg: 'text-3xl font-bold text-foreground tracking-tight',
    },
    compare: {
      sm: 'text-xs text-muted-foreground/70 line-through opacity-80',
      md: 'text-sm text-muted-foreground/70 line-through opacity-80',
      lg: 'text-xl text-muted-foreground/70 line-through opacity-80',
    },
    discount: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
    container: {
      sm: 'space-y-1',
      md: 'space-y-1.5',
      lg: 'space-y-2',
    },
  }

  const variantClasses = {
    container: {
      default: 'flex flex-wrap items-center gap-2 animate-fade-in-up',
      card: 'flex flex-col items-end animate-fade-in',
      detail: 'flex flex-wrap items-center gap-3 animate-fade-in-up',
    },
    priceBox: {
      default: '',
      card: hasDiscount ? 'discount-price-box' : '',
      detail: hasDiscount ? 'discount-price-box-lg' : '',
    },
  }

  const defaultPaymentOptionsText =
    locale === 'ru' ? 'Доступны варианты оплаты' : 'Payment options available'

  return (
    <div
      className={cn(
        'space-y-2 relative group ProductPrice',
        sizeClasses.container[size],
        variant === 'card' && 'price-card-container',
        className,
      )}
    >
      <div className={cn(variantClasses.container[variant], variantClasses.priceBox[variant])}>
        <span
          className={cn(
            sizeClasses.price[size],
            'transition-all duration-300 hover:opacity-90 price-highlight price-shine',
            variant === 'detail' && 'hover:scale-[1.02] origin-left',
            variant === 'card' && 'price-float',
            hasDiscount && variant === 'default' && 'price-pulse price-glow',
            hasDiscount && variant === 'card' && 'price-attention price-blink',
            !hasDiscount && variant === 'default' && 'price-flash',
            hasDiscount && variant === 'card' && 'price-neon',
            hasDiscount && size === 'lg' && 'price-bounce',
            !hasDiscount && size === 'lg' && 'price-rainbow',
            'discount-highlight',
            priceClassName,
          )}
        >
          {formatPrice(finalPrice, locale)}
        </span>

        {hasDiscount && compareAtPrice && (
          <span
            className={cn(
              sizeClasses.compare[size],
              'transition-all duration-300 opacity-70 hover:opacity-90',
              variant === 'detail' && 'hover:scale-[1.02] origin-left',
              variant === 'detail' && 'price-vibrate',
              compareClassName,
            )}
          >
            {formatPrice(compareAtPrice, locale)}
          </span>
        )}

        {showDiscountBadge && hasDiscount && discountPercentage && discountPercentage > 0 && (
          <DiscountBadge
            percentage={discountPercentage}
            className={cn(sizeClasses.discount[size], 'animate-badge-pulse', discountClassName)}
          />
        )}
      </div>

      {showPaymentOptions && (
        <div className="text-sm text-muted-foreground/80 animate-fade-in transition-opacity hover:text-muted-foreground">
          {paymentOptionsText || defaultPaymentOptionsText}
        </div>
      )}
    </div>
  )
}
