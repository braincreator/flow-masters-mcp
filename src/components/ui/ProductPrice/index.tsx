'use client'

import React from 'react'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'
import { type Locale } from '@/constants'
import { DiscountBadge } from '@/components/ui/badges'
import { cn } from '@/utilities/ui'

export function ProductPrice(props) {
  const {
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
  } = props

  const price = getLocalePrice(product, locale)

  let compareAtPrice = null

  if (product.pricing?.[locale]?.compareAtPrice) {
    compareAtPrice = product.pricing[locale].compareAtPrice
  } else if (
    product.pricing?.compareAtPrice &&
    typeof product.pricing.compareAtPrice === 'number'
  ) {
    compareAtPrice = product.pricing.compareAtPrice
  }

  const hasDiscount = compareAtPrice && price && compareAtPrice > price
  let discountPercentage = null

  if (product.pricing?.discountPercentage && product.pricing.discountPercentage > 0) {
    discountPercentage = product.pricing.discountPercentage
  } else if (hasDiscount) {
    discountPercentage = Math.round(100 - (price / compareAtPrice) * 100)
  }

  const sizeClasses = {
    price: {
      sm: 'text-base font-semibold',
      md: 'text-xl font-bold',
      lg: 'text-3xl font-bold',
    },
    compare: {
      sm: 'text-xs text-muted-foreground line-through',
      md: 'text-sm text-muted-foreground line-through',
      lg: 'text-xl text-muted-foreground line-through',
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
          {formatPrice(price, locale)}
        </span>

        {hasDiscount && (
          <span className={cn(sizeClasses.compare[size], compareClassName)}>
            {formatPrice(compareAtPrice, locale)}
          </span>
        )}

        {showDiscountBadge && discountPercentage && discountPercentage > 0 && (
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
