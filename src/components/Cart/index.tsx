'use client'

import React from 'react'
import { useCart, CartItem } from '@/providers/CartProvider' // Import CartItem
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'
import { useTranslations } from 'next-intl'
import { Product, Service } from '@/payload-types' // Assuming these types exist
import { Locale } from '@/constants' // Assuming Locale type is in constants
import { Loader2 } from 'lucide-react'

interface CartComponentProps {
  locale: Locale
}

export const Cart: React.FC<CartComponentProps> = ({ locale }) => {
  const { items = [], isLoading, error } = useCart(locale)
  const t = useTranslations('Cart')

  const calculateTotal = (currentItems: CartItem[]): number => {
    return currentItems.reduce((sum, item) => {
      let price = 0
      if (item.itemType === 'product' && item.product) {
        price = getLocalePrice(item.product as Product, locale)
      } else if (item.itemType === 'service' && item.service) {
        price = getLocalePrice(item.service as Service, locale)
      }
      return sum + price * item.quantity
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{t('error')}</div>
  }

  if (items.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">{t('emptyCart')}</div>
  }

  // Helper to get item ID
  const getItemId = (item: CartItem): string => {
    if (item.itemType === 'product' && item.product && typeof item.product !== 'string') {
      return item.product.id
    }
    if (item.itemType === 'service' && item.service && typeof item.service !== 'string') {
      return item.service.id
    }
    // Fallback or throw error if item structure is unexpected
    // For now, using a placeholder if id is not found, though this should be handled robustly
    return `unknown-item-${Math.random().toString(36).substring(7)}`
  }


  return (
    <div className="cart space-y-6">
      <div className="divide-y divide-border">
        {items.map((item) => {
          let price = 0
          let title = 'Unknown Item' // Default title
          const itemId = getItemId(item) // Get a unique key for the item

          if (item.itemType === 'product' && item.product && typeof item.product !== 'string') {
            price = getLocalePrice(item.product, locale)
            title = item.product.title || 'Product'
          } else if (item.itemType === 'service' && item.service && typeof item.service !== 'string') {
            price = getLocalePrice(item.service, locale)
            title = item.service.title || 'Service'
          }
          const itemTotal = price * item.quantity

          return (
            <div key={itemId} className="cart-item flex justify-between items-center py-4">
              <div className="flex-grow">
                <span className="font-medium">{title}</span>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(price, locale)} x {item.quantity}
                </div>
              </div>
              <span className="font-semibold">{formatPrice(itemTotal, locale)}</span>
            </div>
          )
        })}
      </div>

      <div className="cart-total pt-6 border-t border-border flex justify-between items-center">
        <strong className="text-xl">{t('totalLabel')}</strong>
        <strong className="text-xl">{formatPrice(calculateTotal(items), locale)}</strong>
      </div>
    </div>
  )
}
