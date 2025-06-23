'use client'

import { useCart } from '@/providers/CartProvider'
import { Product } from '@/payload-types'
import { useI18n } from '@/providers/I18n'
import { translations } from '@/app/(frontend)/[lang]/products/translations'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/utilities/ui'
import { Loader2 } from 'lucide-react'
import { Locale } from '@/constants'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export interface AddToCartProps {
  productId: string
  productType: Product['productType']
  className?: string
  locale: Locale
}

export const AddToCart: React.FC<AddToCartProps> = ({
  productId,
  productType,
  className,
  locale,
}) => {
  const { add, isLoading: isCartLoading } = useCart(locale)
  const { lang } = useI18n()
  const t = translations[(lang || 'en') as keyof typeof translations]

  const [isAdding, setIsAdding] = useState(false)

  const getButtonText = (type: Product['productType']) => {
    switch (type) {
      case 'digital':
        return t.buttons.buyNow
      case 'subscription':
        return t.buttons.subscribe
      case 'service':
        return t.buttons.bookService
      case 'access':
        return t.buttons.getAccess
      default:
        return t.buttons.buyNow
    }
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      const itemTypeForCart = productType === 'service' ? 'service' : 'product'
      await add(productId, itemTypeForCart, 1)
    } catch (error) {
      logError('Failed to add to cart from component:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || isCartLoading}
      className={cn('add-to-cart-button', productType, className)}
      aria-label={getButtonText(productType)}
    >
      {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {getButtonText(productType)}
    </Button>
  )
}
