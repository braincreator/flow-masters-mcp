'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { ShoppingCart, Download, Clock, Shield } from 'lucide-react'
import { type Locale } from '@/constants'
import { ReactNode } from 'react'
import { useTranslations } from '@/hooks/useTranslations'

export interface AddToCartButtonProps {
  product: any // Using any type to avoid compatibility issues across components
  locale: Locale
  onClick?: (product: any) => void
  size?: 'default' | 'sm' | 'lg'
  className?: string
  disabled?: boolean
  children?: ReactNode
  buttonText?: string
  productType?: string
}

export function AddToCartButton({
  product,
  locale,
  onClick,
  size = 'lg',
  className,
  disabled = false,
  children,
  buttonText,
  productType: propProductType,
}: AddToCartButtonProps) {
  const t = useTranslations(locale)

  // Get button config based on product type
  const getButtonConfig = (type: string = 'physical') => {
    switch (type) {
      case 'digital':
        return {
          text: t.products?.buyNow || (locale === 'ru' ? 'Купить' : 'Buy Now'),
          icon: Download,
        }
      case 'subscription':
        return {
          text: t.products?.subscribe || (locale === 'ru' ? 'Подписаться' : 'Subscribe'),
          icon: Clock,
        }
      case 'service':
        return {
          text: t.products?.bookService || (locale === 'ru' ? 'Заказать услугу' : 'Book Service'),
          icon: Clock,
        }
      case 'access':
        return {
          text: t.products?.getAccess || (locale === 'ru' ? 'Получить доступ' : 'Get Access'),
          icon: Shield,
        }
      default:
        return {
          text: t.products?.addToCart || (locale === 'ru' ? 'В корзину' : 'Add to Cart'),
          icon: ShoppingCart,
        }
    }
  }

  // Use product.productType, propProductType, or default to 'physical'
  const productType = propProductType || product?.productType || 'physical'
  const buttonConfig = getButtonConfig(productType)
  const ButtonIcon = buttonConfig.icon

  // Allow custom button text to override the default text based on product type
  const displayText = buttonText || buttonConfig.text

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick(product)
    }
  }

  return (
    <Button
      onClick={handleClick}
      className={cn(
        'add-to-cart-button flex-1 gap-2',
        'glass-effect interactive-element',
        'relative overflow-hidden group/button',
        'hover:bg-accent hover:text-accent-foreground hover:border-accent',
        'dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-accent',
        'whitespace-nowrap flex items-center justify-center',
        'px-2 sm:px-4',
        className,
      )}
      disabled={disabled || product?.status !== 'published'}
      size={size}
    >
      {children || (
        <>
          <ButtonIcon className="w-5 h-5 flex-shrink-0 mr-1" />
          <span>{displayText}</span>
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent 
                     via-white/20 to-transparent opacity-0 
                     group-hover/button:opacity-100 transition-opacity duration-300 
                     -translate-x-full group-hover/button:translate-x-full
                     dark:opacity-0"
          />
        </>
      )}
    </Button>
  )
}
