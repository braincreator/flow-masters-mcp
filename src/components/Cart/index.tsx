'use client'

import React from 'react'
import { useLocale } from '@/hooks/useLocale'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'

export const Cart: React.FC = () => {
  const { locale } = useLocale()

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => {
      const price = getLocalePrice(item.product, locale)
      return sum + price * item.quantity
    }, 0)
  }

  return (
    <div className="cart">
      {items.map((item) => {
        const price = getLocalePrice(item.product, locale)
        const itemTotal = price * item.quantity

        return (
          <div key={item.id} className="cart-item">
            <span>{item.product.title?.[locale]}</span>
            <span>{formatPrice(price, locale)}</span>
            <span>x {item.quantity}</span>
            <span>{formatPrice(itemTotal, locale)}</span>
          </div>
        )
      })}

      <div className="cart-total">
        <strong>Total: {formatPrice(calculateTotal(items), locale)}</strong>
      </div>
    </div>
  )
}
