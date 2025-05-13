'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, Download, Clock, Shield, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/providers/CartProvider'
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
    enrollNow: 'Enroll Now', // New text
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
    enrollNow: 'Записаться сейчас', // New text
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
  isWaitingListEnrollment?: boolean // Add new prop
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
  isWaitingListEnrollment = false, // Destructure with default
}: AddToCartButtonProps) {
  const { cart, addItem, removeItem, isLoading: isCartLoading } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const texts = LOCALIZED_TEXTS[locale] || LOCALIZED_TEXTS.en

  const isInCartState = useMemo(() => {
    if (isCartLoading || !cart || !cart.items) return false
    return cart.items.some(
      (item) => (typeof item.product === 'string' ? item.product : item.product?.id) === product.id,
    )
  }, [cart, product.id, isCartLoading])

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
    const title = product?.title
    if (!title) return 'Product'

    if (typeof title === 'string') {
      return title
    }

    // Explicitly check if title is an object and has the locale key
    if (typeof title === 'object' && title !== null && locale in title) {
      // Ensure the value is a string before returning
      const localizedTitle = title[locale as keyof typeof title]
      if (typeof localizedTitle === 'string') {
        return localizedTitle
      }
    }

    // Fallback to 'en' if locale title is not found or not a string
    if (typeof title === 'object' && title !== null && 'en' in title) {
      const enTitle = title['en' as keyof typeof title]
      if (typeof enTitle === 'string') {
        return enTitle
      }
    }

    // Final fallback
    return 'Product'
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isCartLoading || isProcessing) return

    setIsProcessing(true)
    const productName = getProductTitle()

    try {
      if (isInCartState) {
        await removeItem(product.id)
        if (showToast) {
          toast.success(removeMessage || texts.removedFromCart(productName))
        }
      } else {
        // Определяем тип элемента для корзины
        const itemType = product.productType === 'service' ? 'service' : 'product'
        await addItem(product.id, itemType)
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

  // Determine button text based on state, including waiting list enrollment
  const currentButtonText = isWaitingListEnrollment
    ? texts.enrollNow // Use enroll text if applicable
    : isInCartState
      ? texts.inCart // Otherwise, use in cart text
      : buttonConfig.text // Otherwise, use default text based on product type

  const CurrentIcon = isInCartState ? Check : ButtonIcon

  // Ensure button is enabled for waiting list enrollment, unless explicitly disabled by parent
  const isDisabled = isWaitingListEnrollment
    ? disabled // Respect parent disabled prop
    : disabled || isCartLoading || isProcessing // Normal disabled conditions

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
      disabled={isDisabled} // Use calculated disabled state
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
