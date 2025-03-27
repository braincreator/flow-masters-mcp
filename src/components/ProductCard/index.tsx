'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Download,
  Clock,
  Shield,
  Star,
  Tag,
  PercentIcon,
  Award,
  Gift,
  Truck,
  BatteryCharging,
  ImageIcon,
  Heart,
} from 'lucide-react'
import type { Product as PayloadProduct } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { formatPrice, getLocalePrice, convertPrice } from '@/utilities/formatPrice'
import { type Locale } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utilities/ui'
import { useState, useEffect } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { SocialSharePopover } from '@/components/ui/SocialSharePopover'
import { useTranslations } from '@/hooks/useTranslations'
import { toast } from 'sonner'
import { AddToCartButton } from '@/components/ui/AddToCartButton'

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
  rating?: number
  featuredImage?: {
    url: string
    alt?: string
  }
  categories?: Array<{
    id: string
    title: string | Record<string, string>
    slug?: string
  }>
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
      toast.success(t.sharing?.linkCopied || 'Removed from favorites')
    } else {
      addToFavorites(product)
      toast.success(t.sharing?.linkCopied || 'Added to favorites')
    }
    setIsFav(!isFav)
  }

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

  const getProductType = (): string => {
    return product.productType || 'physical'
  }

  const getButtonConfig = (type: string) => {
    switch (type) {
      case 'digital':
        return {
          text: locale === 'ru' ? 'Купить' : 'Buy Now',
          icon: Download,
        }
      case 'subscription':
        return {
          text: locale === 'ru' ? 'Подписаться' : 'Subscribe',
          icon: Clock,
        }
      case 'service':
        return {
          text: locale === 'ru' ? 'Заказать услугу' : 'Book Service',
          icon: Clock,
        }
      case 'access':
        return {
          text: locale === 'ru' ? 'Получить доступ' : 'Get Access',
          icon: Shield,
        }
      default:
        return {
          text: locale === 'ru' ? 'В корзину' : 'Add to Cart',
          icon: ShoppingCart,
        }
    }
  }

  const buttonConfig = getButtonConfig(getProductType())
  const ButtonIcon = buttonConfig.icon

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

  // Generate product URL for sharing
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/products/${product.slug}`
      : ''

  // Get featured image URL for sharing
  const getImageUrl = (item: any) => {
    if (typeof item === 'string') return item
    return item?.url || ''
  }

  const featuredImageUrl = product.thumbnail ? getImageUrl(product.thumbnail) : ''

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
            src={product.featuredImage?.url || getImageUrl(product.thumbnail)}
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
          {isNew && (
            <Badge variant="default" className="bg-accent text-accent-foreground">
              {locale === 'ru' ? 'Новинка' : 'New'}
            </Badge>
          )}

          {isBestseller && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {locale === 'ru' ? 'Хит продаж' : 'Bestseller'}
            </Badge>
          )}

          {discountPercentage && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <PercentIcon className="h-3 w-3" />-{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Price Badge */}
        {price > 0 && (
          <div
            className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm 
                        px-3 py-1 rounded-full border border-border
                        dark:border-border/50 dark:hover:border-accent/30"
          >
            <div className="flex flex-col items-end">
              <span className="font-semibold">{formatPrice(price, locale)}</span>

              {compareAtPrice && compareAtPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(compareAtPrice, locale)}
                </span>
              )}
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4 space-y-4">
        {/* Type & Rating */}
        <div className="flex justify-between items-center">
          {/* Product Type Badge */}
          <Badge
            variant="outline"
            className="text-xs bg-accent/5 border-accent/20 text-accent-foreground"
          >
            {getProductType() === 'digital' ? (
              <Download className="h-3 w-3 mr-1" />
            ) : getProductType() === 'subscription' ? (
              <BatteryCharging className="h-3 w-3 mr-1" />
            ) : (
              <Tag className="h-3 w-3 mr-1" />
            )}
            {getProductType()}
          </Badge>

          {/* Rating Stars - Replace with your actual rating system */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

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

        {/* Features Highlights */}
        {product.features && product.features.length > 0 && (
          <ul className="text-sm grid grid-cols-1 gap-1">
            {product.features.slice(0, 2).map((feature, index) => (
              <li key={index} className="flex items-start gap-1.5">
                <div className="rounded-full bg-accent/10 p-0.5 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-2.5 w-2.5 text-accent"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-muted-foreground line-clamp-1">
                  {typeof feature === 'string' ? feature : feature.feature || ''}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Categories & Tags */}
        {((product.categories && product.categories.length > 0) ||
          (product.tags && product.tags.length > 0)) && (
          <div className="flex flex-wrap gap-2">
            {/* Categories */}
            {product.categories &&
              product.categories.length > 0 &&
              product.categories.slice(0, 2).map((category) => (
                <span
                  key={category.id}
                  className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full
                          dark:border dark:border-border/50 dark:hover:border-accent/30
                          transition-colors duration-200"
                >
                  {typeof category.title === 'object' ? category.title[locale] : category.title}
                </span>
              ))}

            {/* Tags */}
            {product.tags &&
              product.tags.length > 0 &&
              product.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-accent bg-accent/5 px-2 py-1 rounded-full
                          border border-accent/20
                          transition-colors duration-200"
                >
                  {typeof tag === 'string' ? tag : tag.tag || ''}
                </span>
              ))}
          </div>
        )}

        {/* Action Buttons and Sharing */}
        <div className="flex gap-2">
          <AddToCartButton
            product={product}
            locale={locale}
            onClick={onAddToCart}
            disabled={product.status !== 'published'}
          />

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 p-0 shrink-0"
            onClick={handleFavoriteToggle}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>

          <SocialSharePopover
            url={productUrl}
            title={typeof product.title === 'object' ? product.title[locale] : product.title}
            description={t.sharing?.shareVia || 'Check out this product!'}
            image={featuredImageUrl}
            lang={locale}
            triggerClassName="h-12 w-12 p-0"
          />
        </div>

        {/* Product Info Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 pt-1">
          {/* Subscription Info */}
          {getProductType() === 'subscription' && product.pricing?.[locale]?.interval && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{product.pricing[locale].interval}</span>
              <span className="mx-1">•</span>
              <Shield className="h-3 w-3" />
              <span>
                {t.products?.autoRenewal || (locale === 'ru' ? 'Автопродление' : 'Auto-renewal')}
              </span>
            </div>
          )}

          {/* Free Delivery */}
          {hasFreeDelivery && (
            <div className="flex items-center gap-1.5 text-success">
              <Truck className="h-3 w-3" />
              <span>{locale === 'ru' ? 'Бесплатная доставка' : 'Free delivery'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
