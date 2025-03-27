'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utilities/ui'
import { type Locale } from '@/constants'

export interface FavoriteButtonProps {
  product: any
  locale: Locale
  size?: 'default' | 'sm' | 'lg'
  className?: string
  iconClassName?: string
  disabled?: boolean
  successMessage?: string
  removeMessage?: string
}

export function FavoriteButton({
  product,
  locale,
  size = 'lg',
  className,
  iconClassName,
  disabled = false,
  successMessage,
  removeMessage,
}: FavoriteButtonProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (product?.id) {
      setIsFav(isFavorite(product.id))
    }
  }, [product?.id, isFavorite])

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isFav) {
      removeFromFavorites(product.id)
      toast.success(
        removeMessage || (locale === 'ru' ? 'Удалено из избранного' : 'Removed from favorites'),
      )
    } else {
      addToFavorites(product)
      toast.success(
        successMessage || (locale === 'ru' ? 'Добавлено в избранное' : 'Added to favorites'),
      )
    }
    setIsFav(!isFav)
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={cn('h-12 w-12 p-0 shrink-0', className)}
      onClick={handleFavoriteToggle}
      disabled={disabled}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={cn(`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`, iconClassName)} />
    </Button>
  )
}
