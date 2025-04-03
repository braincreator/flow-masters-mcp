'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utilities/ui'
import { type Locale } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

// Define localized texts for each supported locale
const LOCALIZED_TEXTS = {
  en: {
    addedToFavorites: (productName: string) => `${productName} added to favorites`,
    removedFromFavorites: (productName: string) => `${productName} removed from favorites`,
    ariaLabelAdd: 'Add to favorites',
    ariaLabelRemove: 'Remove from favorites',
    buttonTextAdd: 'Add to favorites',
    buttonTextRemove: 'In favorites',
    loginRequired: 'Please log in to manage favorites.',
  },
  ru: {
    addedToFavorites: (productName: string) => `${productName} добавлен в избранное`,
    removedFromFavorites: (productName: string) => `${productName} удален из избранного`,
    ariaLabelAdd: 'Добавить в избранное',
    ariaLabelRemove: 'Удалить из избранного',
    buttonTextAdd: 'В избранное',
    buttonTextRemove: 'В избранном',
    loginRequired: 'Пожалуйста, войдите, чтобы управлять избранным.',
  },
  // Add other languages here following the same pattern
}

export interface FavoriteButtonProps {
  productId: string
  product?: { title?: string | { [key: string]: string } }
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
  productId,
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
  const { isFavorite, toggle, isLoading: isLoadingFavorites, favoriteProductIds } = useFavorites()
  const { user, isLoading: isLoadingAuth, isAuthenticated } = useAuth()

  // Если пользователь не авторизован или происходит загрузка статуса авторизации, не показываем кнопку
  if (isLoadingAuth || !isAuthenticated || !user) {
    return null
  }

  const isCurrentlyFavorite = isFavorite(productId)

  const texts = LOCALIZED_TEXTS[locale] || LOCALIZED_TEXTS.en

  const getProductTitle = () => {
    if (!product?.title) return 'Product'
    return typeof product.title === 'object'
      ? product.title[locale] || product.title.en || 'Product'
      : product.title
  }

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Двойная проверка авторизации перед выполнением действия
    if (isLoadingAuth || !isAuthenticated || !user) {
      toast.error(texts.loginRequired)
      return
    }

    if (isLoadingFavorites || favoriteProductIds === undefined) {
      toast.warning('Favorites are still loading...')
      return
    }

    const productName = getProductTitle()
    const currentState = isFavorite(productId)

    console.log('[FavoriteButton] Toggling favorite for productId:', productId)

    await toggle(productId)

    if (showToast) {
      if (currentState) {
        toast.success(removeMessage || texts.removedFromFavorites(productName))
      } else {
        toast.success(successMessage || texts.addedToFavorites(productName))
      }
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={cn('p-0', className)}
      onClick={handleFavoriteToggle}
      disabled={disabled || isLoadingFavorites || favoriteProductIds === undefined}
      aria-label={isCurrentlyFavorite ? texts.ariaLabelRemove : texts.ariaLabelAdd}
      title={isCurrentlyFavorite ? texts.ariaLabelRemove : texts.ariaLabelAdd}
    >
      <Heart
        className={cn(
          'h-5 w-5',
          isCurrentlyFavorite ? 'fill-red-500 text-red-500' : '',
          iconClassName,
        )}
      />
      <span className="sr-only">
        {isCurrentlyFavorite ? texts.buttonTextRemove : texts.buttonTextAdd}
      </span>
    </Button>
  )
}
