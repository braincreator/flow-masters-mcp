'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, Download, Clock, Shield, Check } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/utilities/ui'

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
  product: any
  locale: string
  onClick?: (product: any) => void
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
  const t = useTranslations(locale)
  const cart = useCart()

  // Get the appropriate localized texts, falling back to English if not supported
  const texts = LOCALIZED_TEXTS[locale] || LOCALIZED_TEXTS.en

  const getButtonConfig = (type: string) => {
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

  const getProductTitle = () => {
    if (!product?.title) return ''
    return typeof product.title === 'object'
      ? product.title[locale] || product.title.en || ''
      : product.title
  }

  const buttonConfig = getButtonConfig(product.productType || 'physical')
  const ButtonIcon = buttonConfig.icon

  // Fix the isInCart function call
  const isInCartState = cart.isInCart(product.id)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const productName = getProductTitle()

    if (isInCartState) {
      cart.removeFromCart(product.id)
      if (showToast) {
        toast.success(removeMessage || texts.removedFromCart(productName))
      }
    } else {
      cart.addToCart(product)
      if (showToast) {
        toast.success(successMessage || texts.addedToCart(productName))
      }
    }

    if (onClick) {
      onClick(product)
    }
  }

  return (
    <Button
      variant={isInCartState ? 'outline' : 'default'}
      size={size}
      className={cn(
        'relative group whitespace-nowrap min-w-[120px]',
        isInCartState && 'border-accent bg-accent/10 hover:bg-accent/20 text-accent font-medium',
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-label={isInCartState ? texts.ariaLabelRemove : texts.ariaLabelAdd}
      title={isInCartState ? texts.ariaLabelRemove : texts.ariaLabelAdd}
    >
      {children || (
        <>
          {isInCartState ? (
            <Check className="h-5 w-5 mr-2 text-accent flex-shrink-0" />
          ) : (
            <ButtonIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <span className="text-sm sm:text-base overflow-hidden text-ellipsis">
            {isInCartState ? texts.inCart : buttonConfig.text}
          </span>
        </>
      )}
    </Button>
  )
}
