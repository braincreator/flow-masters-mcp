'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, Download, Clock, Shield, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/utilities/ui'
import { Locale } from '@/constants'
import { Product } from '@/payload-types'
import { useState, useMemo } from 'react'

// Define localized texts for each supported locale
const LOCALIZED_TEXTS = {
  en: {
    addToCart: 'Add to Cart',
    inCart: 'In Cart',
    buyNow: 'Buy Now',
    subscribe: 'Subscribe',
    bookService: 'Book Service',
    getAccess: 'Get Access',
    addedToCart: (productName: string) => `${productName} added to cart`,
    removedFromCart: (productName: string) => `${productName} removed from cart`,
    ariaLabelAdd: 'Add to cart',
    ariaLabelRemove: 'Remove from cart',
  },
  ru: {
    addToCart: 'В корзину',
    inCart: 'В корзине',
    buyNow: 'Купить',
    subscribe: 'Подписаться',
    bookService: 'Заказать услугу',
    getAccess: 'Получить доступ',
    addedToCart: (productName: string) => `${productName} добавлен в корзину`,
    removedFromCart: (productName: string) => `${productName} удален из корзины`,
    ariaLabelAdd: 'Добавить в корзину',
    ariaLabelRemove: 'Удалить из корзины',
  },
  // Add other languages here following the same pattern
}

interface AddToCartButtonProps {
  product: Product
  locale: Locale
  onClick?: (product: Product) => void
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  showToast?: boolean
  successMessage?: string
  removeMessage?: string
}

export function AddToCartButton({
  product,
  locale,
  onClick,
  size = 'default',
  className,
  disabled = false,
  children,
  showToast = true,
  successMessage,
  removeMessage,
}: AddToCartButtonProps) {
  const { items, add, remove, isLoading: isCartLoading } = useCart(locale)
  const [isProcessing, setIsProcessing] = useState(false)

  const texts = LOCALIZED_TEXTS[locale] || LOCALIZED_TEXTS.en

  const isInCartState = useMemo(() => {
    if (isCartLoading || !items) return false
    return items.some(
      (item) => (typeof item.product === 'string' ? item.product : item.product?.id) === product.id,
    )
  }, [items, product.id, isCartLoading])

  const getButtonConfig = (type: Product['productType']) => {
    switch (type) {
      case 'digital':
        return {
          text: texts.buyNow,
          icon: Download,
        }
      case 'subscription':
        return {
          text: texts.subscribe,
          icon: Clock,
        }
      case 'service':
        return {
          text: texts.bookService,
          icon: Clock,
        }
      case 'access':
        return {
          text: texts.getAccess,
          icon: Shield,
        }
      default:
        return {
          text: texts.addToCart,
          icon: ShoppingCart,
        }
    }
  }

  const buttonConfig = getButtonConfig(product.productType)
  const ButtonIcon = buttonConfig.icon

  const getProductTitle = () => {
    if (!product?.title) return 'Product'
    return typeof product.title === 'object'
      ? product.title[locale] || product.title.en || 'Product'
      : product.title
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isCartLoading || isProcessing) return

    setIsProcessing(true)
    const productName = getProductTitle()

    try {
      if (isInCartState) {
        await remove(product.id)
        if (showToast) {
          toast.success(removeMessage || texts.removedFromCart(productName))
        }
      } else {
        await add(product.id, 1)
        if (showToast) {
          toast.success(successMessage || texts.addedToCart(productName))
        }
      }
      if (onClick) {
        onClick(product)
      }
    } catch (error) {
      console.error('Error in AddToCartButton click handler:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const currentButtonText = isInCartState ? texts.inCart : buttonConfig.text
  const CurrentIcon = isInCartState ? Check : ButtonIcon

  return (
    <Button
      variant={isInCartState ? 'outline' : 'accent'}
      size={size}
      className={cn(
        'relative group whitespace-nowrap min-w-[120px] h-[40px] transition-all',
        isInCartState && 'border-accent text-accent font-medium',
        (isProcessing || isCartLoading) && 'opacity-70 cursor-not-allowed',
        className,
      )}
      onClick={handleClick}
      disabled={disabled || isCartLoading || isProcessing}
      aria-label={isInCartState ? texts.ariaLabelRemove : texts.ariaLabelAdd}
      title={isInCartState ? texts.ariaLabelRemove : texts.ariaLabelAdd}
    >
      {children || (
        <>
          {isProcessing ? (
            <Loader2 className="h-5 w-5 mr-2 flex-shrink-0 animate-spin" />
          ) : (
            <CurrentIcon
              className={cn(
                'h-5 w-5 mr-2 flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
                isInCartState && 'text-accent',
              )}
            />
          )}
          <span className="text-sm sm:text-base overflow-hidden text-ellipsis">
            {currentButtonText}
          </span>
        </>
      )}
    </Button>
  )
}
