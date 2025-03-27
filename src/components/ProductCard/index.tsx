'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Download, Clock, Shield, ImageIcon } from 'lucide-react'
import type { Product as PayloadProduct } from '@/payload-types'
import { formatPrice, getLocalePrice, convertPrice } from '@/utilities/formatPrice'
import { type Locale } from '@/constants'
import { cn } from '@/utilities/ui'
import { useState, useEffect } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { useTranslations } from '@/hooks/useTranslations'
import { toast } from 'sonner'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { ShareButton } from '@/components/ui/ShareButton'
import { NewBadge, BestsellerBadge, DiscountBadge } from '@/components/ui/badges'
import { ProductPrice } from '@/components/ui/ProductPrice'

// Enhanced Product interface that extends the base PayloadProduct
interface EnhancedProduct extends PayloadProduct {
  productType: 'physical' | 'digital' | 'subscription' | 'service' | 'access'
  pricing?: {
    [locale: string]: {
      amount: number
      compareAtPrice?: number
      interval?: string
    }
  }
  isBestseller?: boolean
  hasFreeDelivery?: boolean
  featuredImage?: {
    url: string
    alt?: string
  }
}

interface ProductCardProps {
  product: EnhancedProduct
  locale: Locale
  layout?: 'grid' | 'list'
  onAddToCart?: (product: EnhancedProduct) => void
}

export function ProductCard({ product, locale, layout = 'grid', onAddToCart }: ProductCardProps) {
  const router = useRouter()
  const t = useTranslations(locale)
  const { isFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (product?.id) {
      const currentIsFavorite = isFavorite(product.id)
      setIsFav(currentIsFavorite)

      if (process.env.NODE_ENV === 'development') {
        console.log(`[ProductCard] Product ${product.id} isFavorite:`, currentIsFavorite)
      }
    }
  }, [product?.id, isFavorite])

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click was directly on the card and not on a button or link
    if (
      e.target instanceof HTMLElement &&
      !e.target.closest('button') &&
      !e.target.closest('a') &&
      !e.defaultPrevented
    ) {
      router.push(`/${locale}/products/${product.slug}`)
    }
  }

  // Helper functions to handle different product data structures
  const getProductPrice = () => {
    // This automatically applies currency conversion based on the target locale
    return getLocalePrice(product, locale)
  }

  const getCompareAtPrice = () => {
    // First check for locale-specific compareAtPrice
    if (product.pricing?.[locale]?.compareAtPrice) {
      return product.pricing[locale].compareAtPrice
    }

    // If there's no locale-specific compareAtPrice, try to use the base price as compare price
    // if that's different from the locale price
    const localePrice = getLocalePrice(product, locale)
    if (product.pricing?.basePrice && typeof product.pricing.basePrice === 'number') {
      const basePrice = product.pricing.basePrice
      // Convert the base price to the target locale's currency for comparison
      const baseLocale =
        typeof product.pricing?.baseLocale === 'string' ? product.pricing.baseLocale : 'en'
      const convertedBasePrice = convertPrice(basePrice, baseLocale, locale)
      if (convertedBasePrice !== localePrice && convertedBasePrice > localePrice) {
        return convertedBasePrice
      }
    }

    return null
  }

  const getProductType = (): 'physical' | 'digital' | 'subscription' | 'service' | 'access' => {
    return product.productType || 'physical'
  }

  // Calculate discount percentage if available
  const price = getProductPrice()
  const compareAtPrice = getCompareAtPrice()
  const hasDiscount = compareAtPrice && price && compareAtPrice > price
  const discountPercentage = hasDiscount ? Math.round(100 - (price / compareAtPrice) * 100) : null

  // Determine if product is new (published within last 14 days)
  const isNew = product.publishedAt
    ? (new Date().getTime() - new Date(product.publishedAt).getTime()) / (1000 * 3600 * 24) < 14
    : false

  // Determine if product is a bestseller
  const isBestseller = product.isBestseller || false

  // Determine if product has free delivery
  const hasFreeDelivery = product.hasFreeDelivery || getProductType() === 'digital'

  // Text for no image placeholder
  const noImageText = locale === 'ru' ? 'Нет изображения' : 'No image'

  const getAddToCartMessage = () => {
    const productName = typeof product.title === 'object' ? product.title[locale] : product.title
    return locale === 'ru' ? `${productName} добавлен в корзину` : `${productName} added to cart`
  }

  const getRemoveFromCartMessage = () => {
    const productName = typeof product.title === 'object' ? product.title[locale] : product.title
    return locale === 'ru' ? `${productName} удален из корзины` : `${productName} removed from cart`
  }

  return (
    <div
      className={`group bg-card rounded-xl border border-border overflow-hidden
        transition-all duration-300 hover:shadow-lg cursor-pointer
        dark:border-border/50 dark:hover:border-accent/30
        ${layout === 'list' ? 'flex gap-6' : 'flex flex-col'}
      `}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <Link
        href={`/${locale}/products/${product.slug}`}
        className={`
          relative overflow-hidden
          dark:border-b dark:border-border/50 dark:group-hover:border-accent/30
          ${layout === 'list' ? 'w-48 h-48 shrink-0' : 'w-full aspect-[4/3]'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {product.featuredImage?.url || product.thumbnail ? (
          <Image
            src={
              product.featuredImage?.url ||
              (typeof product.thumbnail === 'string'
                ? product.thumbnail
                : product.thumbnail?.url || '')
            }
            alt={
              product.featuredImage?.alt ||
              (typeof product.title === 'object' ? product.title[locale] : product.title)
            }
            fill
            sizes={
              layout === 'list'
                ? '200px'
                : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            }
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
              <span className="text-sm">{noImageText}</span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && <NewBadge locale={locale} />}
          {isBestseller && <BestsellerBadge locale={locale} />}
          {discountPercentage && <DiscountBadge percentage={discountPercentage} />}
        </div>

        {/* Price Badge - Используем ProductPrice */}
        {price > 0 && (
          <div
            className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm 
                        px-3 py-1 rounded-full border border-border
                        dark:border-border/50 dark:hover:border-accent/30"
          >
            <ProductPrice
              product={product}
              locale={locale}
              size="sm"
              variant="card"
              showDiscountBadge={false}
            />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4 space-y-2">
        {/* Title */}
        <Link
          href={`/${locale}/products/${product.slug}`}
          className="group-hover:text-accent transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold line-clamp-2">
            {typeof product.title === 'object' ? product.title[locale] : product.title}
          </h2>
        </Link>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {typeof product.shortDescription === 'object'
              ? product.shortDescription[locale]
              : product.shortDescription}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <AddToCartButton
            product={product}
            locale={locale}
            onClick={(product) => {
              if (onAddToCart) onAddToCart(product)
            }}
            disabled={product.status !== 'published'}
            showToast={true}
            successMessage={getAddToCartMessage()}
            removeMessage={getRemoveFromCartMessage()}
            className="flex-1"
          />

          <FavoriteButton
            product={product}
            locale={locale}
            showToast={true}
            size="icon"
            className="h-[40px] w-[40px]"
          />

          <ShareButton
            product={product}
            locale={locale}
            showToastOnCopy={true}
            copyMessage={t.sharing?.linkCopied || 'Link copied!'}
            size="icon"
            className="h-[40px] w-[40px]"
          />
        </div>

        {/* Delivery Info - Only show if free delivery */}
        {hasFreeDelivery && (
          <div className="text-xs text-success pt-1">
            {locale === 'ru' ? 'Бесплатная доставка' : 'Free delivery'}
          </div>
        )}
      </div>
    </div>
  )
}
