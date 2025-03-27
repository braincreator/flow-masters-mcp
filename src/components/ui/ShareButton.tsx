'use client'

import { Button } from '@/components/ui/button'
import { SocialSharePopover } from '@/components/ui/SocialSharePopover'
import { type Locale } from '@/constants'
import { cn } from '@/utilities/ui'

export interface ShareButtonProps {
  product: any
  locale: Locale
  size?: 'default' | 'sm' | 'lg'
  className?: string
  description?: string
}

export function ShareButton({
  product,
  locale,
  size = 'lg',
  className,
  description,
}: ShareButtonProps) {
  // Generate product URL for sharing based on product slug
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/products/${product.slug}`
      : ''

  // Get the product title in the correct locale
  const getTitle = () => {
    if (typeof product.title === 'object') {
      return product.title[locale] || product.title['en'] || product.title
    }
    return product.title
  }

  // Get featured image URL for sharing
  const getImageUrl = (item: any) => {
    if (!item) return ''
    if (typeof item === 'string') return item
    return item?.url || ''
  }

  const getProductImage = () => {
    // First check for featuredImage
    if (product.featuredImage) {
      return getImageUrl(product.featuredImage)
    }
    // Then check for gallery images
    if (product.gallery && product.gallery.length > 0) {
      return getImageUrl(product.gallery[0].image)
    }
    // Finally fall back to thumbnail
    return getImageUrl(product.thumbnail)
  }

  // Determine the sharing description
  const sharingDescription =
    description || (locale === 'ru' ? 'Посмотрите этот товар!' : 'Check out this product!')

  return (
    <SocialSharePopover
      url={productUrl}
      title={getTitle()}
      description={sharingDescription}
      image={getProductImage()}
      lang={locale}
      triggerClassName={cn('h-12 w-12 p-0', className)}
    />
  )
}
