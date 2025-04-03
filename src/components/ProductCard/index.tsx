'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Download, Clock, Shield, ImageIcon } from 'lucide-react'
import type { Product as PayloadProduct } from '@/payload-types'
import { formatPrice, getLocalePrice, convertPrice } from '@/utilities/formatPrice'
import { type Locale } from '@/constants'
import { cn } from '@/utilities/ui'
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
      className={cn(
        'group bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer dark:border-border/50 dark:hover:border-accent/30 h-auto',
        layout === 'list'
          ? 'flex items-start py-4 gap-6 md:gap-6 w-full'
          : 'flex flex-col min-w-[260px]',
      )}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <Link
        href={`/${locale}/products/${product.slug}`}
        className={cn(
          'relative overflow-hidden dark:border-b dark:border-border/50 dark:group-hover:border-accent/30',
          layout === 'list'
            ? 'w-24 h-24 shrink-0 ml-4 md:w-32 md:h-32 lg:w-36 lg:h-36 mt-1'
            : 'w-full aspect-[4/3]',
        )}
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
                ? '(max-width: 768px) 96px, (max-width: 1024px) 128px, 144px'
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

        {/* Badges - Only show in grid mode or at most one badge in list mode */}
        <div
          className={cn(
            'absolute top-2 left-2 flex gap-2',
            layout === 'list'
              ? 'hidden md:flex md:flex-row md:flex-wrap max-w-[120px]'
              : 'flex-col',
          )}
        >
          {isNew && <NewBadge locale={locale} />}
          {isBestseller && <BestsellerBadge locale={locale} />}
          {discountPercentage && <DiscountBadge percentage={discountPercentage} />}
        </div>

        {/* Price Badge - Only show in grid mode */}
        {price > 0 && layout === 'grid' && (
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

      {/* Content - in list mode, make this a flex container */}
      {layout === 'list' ? (
        <div className="flex flex-1 justify-between items-start h-full relative pl-2 pr-6 pb-[58px] w-full">
          {/* Left Column - Title and Description */}
          <div className="flex flex-col flex-1 space-y-2 md:space-y-3 min-h-[96px] pt-9 min-w-0 pr-4">
            <div>
              {/* Title */}
              <Link
                href={`/${locale}/products/${product.slug}`}
                className="group-hover:text-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold line-clamp-1 md:text-2xl">
                  {typeof product.title === 'object' ? product.title[locale] : product.title}
                </h2>
              </Link>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 mt-2 max-w-2xl">
                  {typeof product.shortDescription === 'object'
                    ? product.shortDescription[locale]
                    : product.shortDescription}
                </p>
              )}
            </div>

            {/* Product Type and Features */}
            <div className="flex gap-3 hidden md:flex mt-auto pb-1">
              {getProductType() === 'digital' && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  <span>{locale === 'ru' ? 'Цифровой товар' : 'Digital Product'}</span>
                </div>
              )}
              {getProductType() === 'subscription' && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>{locale === 'ru' ? 'Подписка' : 'Subscription'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price - Moved to top left */}
          <div className="absolute top-1 left-2 min-w-[100px] md:min-w-[120px]">
            {/* Price */}
            {price > 0 && (
              <div>
                <ProductPrice
                  product={product}
                  locale={locale}
                  size="lg"
                  variant="default"
                  showDiscountBadge={true}
                />
              </div>
            )}
          </div>

          {/* Action Buttons - Absolute positioned in bottom right corner */}
          <div className="absolute bottom-0 left-2 right-6 flex gap-2 w-[calc(100%-2rem)]">
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
              className="h-10 flex-1 min-w-[120px]"
            />

            <div className="flex gap-2 flex-shrink-0">
              {product.id && (
                <FavoriteButton
                  productId={product.id}
                  product={{ title: product.title }}
                  locale={locale}
                  showToast={true}
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                />
              )}

              <ShareButton
                product={product}
                locale={locale}
                showToastOnCopy={true}
                copyMessage={t.sharing?.linkCopied || 'Link copied!'}
                size="icon"
                className="h-10 w-10 flex-shrink-0"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Grid Layout Content */
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
            <p className="text-sm text-muted-foreground line-clamp-2">
              {typeof product.shortDescription === 'object'
                ? product.shortDescription[locale]
                : product.shortDescription}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 mt-auto">
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
              className="flex-1 min-w-[120px]"
            />

            <div className="flex gap-2 flex-shrink-0">
              {product.id && (
                <FavoriteButton
                  productId={product.id}
                  product={{ title: product.title }}
                  locale={locale}
                  showToast={true}
                  size="icon"
                  className="h-[40px] w-[40px] flex-shrink-0"
                />
              )}

              <ShareButton
                product={product}
                locale={locale}
                showToastOnCopy={true}
                copyMessage={t.sharing?.linkCopied || 'Link copied!'}
                size="icon"
                className="h-[40px] w-[40px] flex-shrink-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
