'use client'

import { Button } from '@/components/ui/button'
import { SocialSharePopover } from '@/components/ui/SocialSharePopover'
import { type Locale } from '@/constants'
import { cn } from '@/utilities/ui'
import { toast } from 'sonner'
import { Share2 } from 'lucide-react'

// Define localized texts for each supported locale
const LOCALIZED_TEXTS = {
  en: {
    share: 'Share',
    copyLink: 'Copy link',
    linkCopied: 'Link copied to clipboard',
    shareDescription: (productName: string) => `Check out this product: ${productName}`,
    linkCopiedWithProduct: (productName: string) => `Link to ${productName} copied!`,
  },
  ru: {
    share: 'Поделиться',
    copyLink: 'Копировать ссылку',
    linkCopied: 'Ссылка скопирована',
    shareDescription: (productName: string) => `Посмотрите этот товар: ${productName}`,
    linkCopiedWithProduct: (productName: string) => `Ссылка на ${productName} скопирована!`,
  },
  // Add other languages here following the same pattern
}

export interface ShareButtonProps {
  product: any
  locale: Locale
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  description?: string
  onShareComplete?: () => void
  showToastOnCopy?: boolean
  copyMessage?: string
}

export function ShareButton({
  product,
  locale,
  size = 'default',
  className,
  description,
  onShareComplete,
  showToastOnCopy = true,
  copyMessage,
}: ShareButtonProps) {
  // Get localized texts with fallback to English
  const texts = LOCALIZED_TEXTS[locale] || LOCALIZED_TEXTS.en

  // Generate product URL for sharing
  const productUrl = `/${locale}/products/${product.slug}`

  // Get the product title in the correct locale
  const getTitle = () => {
    if (!product?.title) return ''
    if (typeof product.title === 'object') {
      return product.title[locale] || product.title['en'] || ''
    }
    return product.title
  }

  const productTitle = getTitle()

  // Get featured image URL for sharing
  const getImageUrl = (item: any) => {
    if (!item) return ''
    if (typeof item === 'string') return item
    return item?.url || ''
  }

  const getProductImage = () => {
    let imageUrl = ''

    // First check for featuredImage
    if (product.featuredImage) {
      imageUrl = getImageUrl(product.featuredImage)
    }
    // Then check for gallery images
    else if (product.gallery && product.gallery.length > 0) {
      imageUrl = getImageUrl(product.gallery[0].image)
    }
    // Finally fall back to thumbnail
    else if (product.thumbnail) {
      imageUrl = getImageUrl(product.thumbnail)
    }

    return imageUrl
  }

  // Determine the sharing description
  const sharingDescription = description || texts.shareDescription(productTitle || '')

  // Generate absolute product URL for sharing - важно для работы OpenGraph
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const fullProductUrl = origin ? `${origin}${productUrl}` : ''

  // Handler for when link is copied
  const handleLinkCopied = () => {
    if (showToastOnCopy) {
      toast.success(copyMessage || texts.linkCopiedWithProduct(productTitle || ''))
    }
    if (onShareComplete) {
      onShareComplete()
    }
  }

  return (
    <SocialSharePopover
      url={fullProductUrl}
      title={productTitle}
      description={sharingDescription}
      image={getProductImage()}
      lang={locale}
      triggerClassName={cn('relative group', className)}
      onLinkCopied={handleLinkCopied}
      gridColumns={4}
      platforms={[
        'facebook',
        'x',
        'linkedin',
        'vk',
        'telegram',
        'whatsapp',
        'email',
        'instagram',
        'threads',
        'tenchat',
        'copy',
      ]}
    />
  )
}
