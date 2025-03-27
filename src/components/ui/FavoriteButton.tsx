'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utilities/ui'
import { type Locale } from '@/constants'
import { useTranslations } from '@/hooks/useTranslations'

// Define localized texts for each supported locale
const LOCALIZED_TEXTS = {
  en: {
    addedToFavorites: (productName: string) => `${productName} added to favorites`,
    removedFromFavorites: (productName: string) => `${productName} removed from favorites`,
    ariaLabelAdd: 'Add to favorites',
    ariaLabelRemove: 'Remove from favorites',
    buttonTextAdd: 'Add to favorites',
    buttonTextRemove: 'In favorites',
  },
  ru: {
    addedToFavorites: (productName: string) => `${productName} добавлен в избранное`,
    removedFromFavorites: (productName: string) => `${productName} удален из избранного`,
    ariaLabelAdd: 'Добавить в избранное',
    ariaLabelRemove: 'Удалить из избранного',
    buttonTextAdd: 'В избранное',
    buttonTextRemove: 'В избранном',
  },
  // Add other languages here following the same pattern
}

export interface FavoriteButtonProps {
  product: any
  locale: Locale
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  iconClassName?: string
  disabled?: boolean
  successMessage?: string
  removeMessage?: string
  showToast?: boolean
}

export function FavoriteButton({
  product,
  locale,
  size = 'default',
  className,
  iconClassName,
  disabled = false,
  successMessage,
  removeMessage,
  showToast = true,
}: FavoriteButtonProps) {
  const t = useTranslations(locale)
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(false)

  // Get the appropriate localized texts object, falling back to English if locale not supported
  const texts = LOCALIZED_TEXTS[locale] || LOCALIZED_TEXTS.en

  // Проверка избранного при монтировании и при изменении favorites
  useEffect(() => {
    if (product?.id) {
      const currentIsFavorite = isFavorite(product.id)
      setIsFav(currentIsFavorite)
    }
  }, [product?.id, isFavorite])

  const getProductTitle = () => {
    if (!product?.title) return ''
    return typeof product.title === 'object'
      ? product.title[locale] || product.title.en || ''
      : product.title
  }

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const productName = getProductTitle()

    if (isFav) {
      removeFromFavorites(product.id)
      if (showToast) {
        toast.success(removeMessage || texts.removedFromFavorites(productName))
      }
    } else {
      addToFavorites(product)
      if (showToast) {
        toast.success(successMessage || texts.addedToFavorites(productName))
      }
    }
    setIsFav(!isFav)
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={cn('p-0', className)}
      onClick={handleFavoriteToggle}
      disabled={disabled}
      aria-label={isFav ? texts.ariaLabelRemove : texts.ariaLabelAdd}
      title={isFav ? texts.ariaLabelRemove : texts.ariaLabelAdd}
    >
      <Heart className={cn('h-5 w-5', isFav ? 'fill-red-500 text-red-500' : '', iconClassName)} />
      <span className="sr-only">{isFav ? texts.buttonTextRemove : texts.buttonTextAdd}</span>
    </Button>
  )
}
