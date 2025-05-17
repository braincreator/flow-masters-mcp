'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, X, ShoppingBag } from 'lucide-react'
import { Locale } from '@/constants'
import { Product, Service, CartSession, Media } from '@/payload-types'
import { formatPrice, convertPrice } from '@/utilities/formatPrice'
import { cn } from '@/utilities/ui'

// Type for a single cart item, consistent with CheckoutClient
export type CartItemType = NonNullable<CartSession['items']>[0]

interface DetailedCartItemsListProps {
  items: CartItemType[]
  locale: Locale
  removeFromCart: (itemId: string, itemType: 'product' | 'service') => void
  updateItem: (itemId: string, itemType: 'product' | 'service', quantity: number) => void
  itemsLoading?: { [key: string]: boolean }
  isCheckout?: boolean // Optional: to slightly change behavior/style if needed
}

const getItemTitle = (item: CartItemType, locale: Locale): string => {
  const entity = item.itemType === 'service' ? item.service : item.product
  if (entity && typeof entity !== 'string' && entity.title) {
    if (typeof entity.title === 'object' && entity.title !== null) {
      const localizedTitle = (entity.title as any)[locale] || (entity.title as any).en
      if (localizedTitle) return String(localizedTitle)
    } else if (typeof entity.title === 'string') {
      return entity.title
    }
  }
  return item.itemType === 'service' ? 'Service' : 'Product'
}

const getItemImageUrl = (item: CartItemType): string | null => {
  if (item.itemType === 'service' && item.service && typeof item.service !== 'string') {
    const service = item.service as Service
    if (service.thumbnail && typeof service.thumbnail !== 'string') {
      return (service.thumbnail as Media).url || null
    }
  } else if (item.itemType === 'product' && item.product && typeof item.product !== 'string') {
    const product = item.product as Product
    if (product.thumbnail && typeof product.thumbnail !== 'string') {
      return (product.thumbnail as Media).url || null
    }
    if (product.gallery && product.gallery.length > 0 && product.gallery[0]?.image) {
      const firstImageInGallery = product.gallery[0].image
      if (firstImageInGallery && typeof firstImageInGallery !== 'string') {
        return (firstImageInGallery as Media).url || null
      }
    }
  }
  return null
}

export const DetailedCartItemsList: React.FC<DetailedCartItemsListProps> = ({
  items,
  locale,
  removeFromCart,
  updateItem,
  itemsLoading = {},
  isCheckout = false,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="relative mx-auto h-24 w-24 mb-4">
          <div className="absolute inset-0 rounded-full bg-muted/30 animate-pulse" />
          <ShoppingBag className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-6">
          {locale === 'ru'
            ? 'Ваша корзина пуста.'
            : 'Your cart is empty.'}
        </p>
        {!isCheckout && (
            <Button
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                asChild
            >
                <a href={`/${locale}`}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                {locale === 'ru' ? 'Перейти к покупкам' : 'Continue shopping'}
                </a>
            </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item: CartItemType) => {
        const itemId =
          item.itemType === 'service'
            ? typeof item.service === 'string'
              ? item.service
              : item.service?.id
            : typeof item.product === 'string'
              ? item.product
              : item.product?.id
        
        if (!itemId) return null // Should not happen with valid cart items

        const imageUrl = getItemImageUrl(item)
        const title = getItemTitle(item, locale)
        const itemLoadingKey = `${item.itemType}-${itemId}`
        const isLoadingThisItem = itemsLoading[itemLoadingKey] || false

        return (
          <motion.div
            key={`cart-item-${item.itemType}-${itemId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-4 border rounded-lg flex justify-between items-center group hover:border-primary/50 dark:hover:border-primary/30 transition-all duration-300 hover:bg-muted/20 dark:hover:bg-muted/5 transform hover:translate-y-[-3px] hover:shadow-md"
            layout
          >
            <div className="flex items-center flex-grow min-w-0">
              <div className="mr-4 relative h-16 w-16 rounded-md overflow-hidden border border-muted/30 bg-background shadow-sm flex-shrink-0">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/70" />
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-medium line-clamp-2 sm:line-clamp-1">{title}</p>
                <div className="flex items-center mt-1">
                  <Badge
                    variant={
                      item.itemType === 'service' ? 'secondary' : 'default'
                    }
                    className="text-xs h-5"
                  >
                    {item.itemType === 'service'
                      ? locale === 'ru'
                        ? 'Услуга'
                        : 'Service'
                      : locale === 'ru'
                        ? 'Товар'
                        : 'Product'}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-2 flex items-center">
                    {locale === 'ru' ? 'Кол-во' : 'Qty'}:
                    <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded bg-muted/40 text-foreground font-medium text-xs px-1 ml-1">
                      {item.quantity || 0}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 pl-2">
              <p className="font-medium mr-2 sm:mr-4 tabular-nums text-sm sm:text-base">
                {formatPrice(
                  locale === 'ru'
                    ? (item.priceSnapshot || 0) * (item.quantity || 0)
                    : convertPrice(
                        (item.priceSnapshot || 0) * (item.quantity || 0),
                        'ru',
                        locale,
                      ),
                  locale,
                )}
              </p>
              <div className="flex items-center mr-1 sm:mr-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => {
                    if (itemId && item.quantity > 1) {
                      updateItem(
                        itemId,
                        item.itemType,
                        Math.max(1, (item.quantity || 1) - 1),
                      )
                    }
                  }}
                  disabled={isLoadingThisItem || item.quantity <= 1}
                >
                  {isLoadingThisItem ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                  )}
                </Button>
                <span className="mx-1 sm:mx-2 font-medium text-sm min-w-[16px] sm:min-w-[24px] text-center">
                  {item.quantity || 0}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => {
                    if (itemId) {
                      updateItem(
                        itemId,
                        item.itemType,
                        (item.quantity || 1) + 1,
                      )
                    }
                  }}
                  disabled={isLoadingThisItem}
                >
                  {isLoadingThisItem ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full opacity-50 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  if (itemId) {
                    removeFromCart(itemId, item.itemType)
                  }
                }}
                disabled={isLoadingThisItem}
              >
                {isLoadingThisItem ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default DetailedCartItemsList