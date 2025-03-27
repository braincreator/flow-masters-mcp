'use client'

import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Download,
  FileText,
  Clock,
  Shield,
  Package,
  Zap,
  RefreshCw,
  Check,
  Info,
  Truck,
} from 'lucide-react'
import RichText from '@/components/RichText'
import { useTranslations } from '@/hooks/useTranslations'
import { useState, useEffect } from 'react'
import { ImageGallery } from '@/components/ProductDetail/ImageGallery'
import './ProductDetail/styles.css'
import { useFavorites } from '@/hooks/useFavorites'
import { toast } from 'sonner'
import type { Product as ProductType } from '@/payload-types'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { ShareButton } from '@/components/ui/ShareButton'
import {
  CategoryBadge,
  TagBadge,
  RatingBadge,
  DiscountBadge,
  ProductTypeBadge,
  BestsellerBadge,
  NewBadge,
} from '@/components/ui/badges'
import { formatPrice } from '@/utilities/formatPrice'
import { type Locale } from '@/constants'

interface ProductDetailProps {
  product: ProductType & {
    productType?: 'physical' | 'digital' | 'subscription' | 'service' | 'access'
    pricing?: {
      basePrice?: number
      finalPrice?: number
      compareAtPrice?: number
      discountPercentage?: number
      interval?: string
    }
    rating?: number
    digitalContent?: {
      fileSize?: string
    }
    isBestseller?: boolean
    hasFreeDelivery?: boolean
    category?: {
      title: string | Record<string, string>
    }
    specs?: Record<string, string> | any
  }
  lang: Locale
}

export function ProductDetail({ product, lang }: ProductDetailProps) {
  const t = useTranslations(lang)
  const { isFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(false)

  // Determine if product is new (published within last 14 days)
  const isNew = product.publishedAt
    ? (new Date().getTime() - new Date(product.publishedAt).getTime()) / (1000 * 3600 * 24) < 14
    : false

  useEffect(() => {
    if (product?.id) {
      setIsFav(isFavorite(product.id))
    }
  }, [product?.id, isFavorite])

  const getCategoryTitle = () => {
    if (typeof product.category === 'string') {
      return product.category
    }
    return product.category && 'title' in product.category ? product.category.title : ''
  }

  const getProductTitle = () => {
    if (typeof product.title === 'string') {
      return product.title
    }
    return product.title?.[lang] || product.title?.['en'] || ''
  }

  const renderProductTypeInfo = () => {
    if (!product.productType) return null

    switch (product.productType) {
      case 'digital':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Download className="h-4 w-4" />
            <span>{t.products?.instantDelivery || 'Instant Delivery'}</span>
            {product.digitalContent?.fileSize && (
              <>
                <span className="mx-2">•</span>
                <FileText className="h-4 w-4" />
                <span>{product.digitalContent.fileSize}</span>
              </>
            )}
          </div>
        )
      case 'subscription':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{product.pricing?.interval}</span>
            <span className="mx-2">•</span>
            <Shield className="h-4 w-4" />
            <span>{t.products?.autoRenewal || 'Auto-renewal'}</span>
          </div>
        )
      default:
        return null
    }
  }

  // Format product images for the gallery
  const formattedImages =
    product.gallery?.map((item, index) => {
      const image = typeof item.image === 'string' ? { url: item.image } : item.image
      return {
        id: `img-${index}`,
        url: image?.url || '',
        alt: getProductTitle(),
      }
    }) || []

  const handleAddToCart = (productToAdd: any) => {
    console.log('Adding to cart:', productToAdd)
  }

  const getAddToCartMessage = () => {
    return lang === 'ru'
      ? `${getProductTitle()} добавлен в корзину`
      : `${getProductTitle()} added to cart`
  }

  const getRemoveFromCartMessage = () => {
    return lang === 'ru'
      ? `${getProductTitle()} удален из корзины`
      : `${getProductTitle()} removed from cart`
  }

  const getProductDescriptionLabel = () => {
    return lang === 'ru' ? 'Описание' : 'Description'
  }

  const getFeaturesLabel = () => {
    return lang === 'ru' ? 'Особенности' : 'Features'
  }

  const getSpecificationsLabel = () => {
    return lang === 'ru' ? 'Характеристики' : 'Specifications'
  }

  const renderTrustBadges = () => {
    const hasFreeDelivery = product.hasFreeDelivery || product.productType === 'digital'
    const guaranteeLabel = lang === 'ru' ? 'Гарантия' : 'Guarantee'
    const moneyBackLabel = lang === 'ru' ? '30 дней возврата' : '30-day money back'
    const supportLabel = lang === 'ru' ? 'Поддержка' : 'Support'
    const helpLabel = lang === 'ru' ? 'Помощь доступна' : 'Help available'
    const securePackagingLabel = lang === 'ru' ? 'Надёжная упаковка' : 'Secure Packaging'
    const safeDeliveryLabel = lang === 'ru' ? 'Безопасная доставка' : 'Safe delivery'
    const freeDeliveryLabel = lang === 'ru' ? 'Бесплатная доставка' : 'Free delivery'

    return (
      <div className="product-benefits">
        {product.productType !== 'digital' && (
          <div className="benefit-card">
            <Package className="benefit-icon" />
            <div>
              <h4 className="font-medium">{securePackagingLabel}</h4>
              <p className="text-xs text-muted-foreground">{safeDeliveryLabel}</p>
            </div>
          </div>
        )}

        <div className="benefit-card">
          <Shield className="benefit-icon" />
          <div>
            <h4 className="font-medium">{guaranteeLabel}</h4>
            <p className="text-xs text-muted-foreground">{moneyBackLabel}</p>
          </div>
        </div>

        <div className="benefit-card">
          <Info className="benefit-icon" />
          <div>
            <h4 className="font-medium">{supportLabel}</h4>
            <p className="text-xs text-muted-foreground">{helpLabel}</p>
          </div>
        </div>

        {hasFreeDelivery && (
          <div className="benefit-card">
            <Truck className="benefit-icon text-emerald-500" />
            <div>
              <h4 className="font-medium text-emerald-500">{freeDeliveryLabel}</h4>
              <p className="text-xs text-muted-foreground">
                {lang === 'ru' ? 'Для этого товара' : 'For this product'}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="product-detail-container">
      {/* Image Gallery */}
      <ImageGallery images={formattedImages} className="product-image-gallery" locale={lang} />

      {/* Product Info */}
      <div className="product-info">
        {/* Header section */}
        <div className="product-header">
          <div className="badges-container">
            {product.category && (
              <CategoryBadge title={getCategoryTitle()} locale={lang} className="rounded-md" />
            )}

            {product.productType && (
              <ProductTypeBadge type={product.productType} className="rounded-md" />
            )}

            {isNew && <NewBadge locale={lang} className="rounded-md" />}

            {product.isBestseller && <BestsellerBadge locale={lang} className="rounded-md" />}

            {product.tags &&
              product.tags.length > 0 &&
              product.tags
                .slice(0, 2)
                .map((tag, idx) => <TagBadge key={idx} tag={tag} className="rounded-md" />)}

            {product.rating && (
              <div className="ml-auto">
                <RatingBadge rating={product.rating} />
              </div>
            )}
          </div>

          <h1 className="product-title">{getProductTitle()}</h1>

          {renderProductTypeInfo() && (
            <div className="product-type-info">{renderProductTypeInfo()}</div>
          )}
        </div>

        {/* Price section */}
        <div className="price-section">
          <div className="price-tag">
            <span className="text-3xl font-bold">
              {formatPrice(
                product.pricing?.finalPrice || product.pricing?.basePrice || product.price || 0,
                lang,
              )}
            </span>

            {product.pricing?.compareAtPrice && product.pricing.compareAtPrice > 0 && (
              <span className="original-price">
                {formatPrice(product.pricing.compareAtPrice, lang)}
              </span>
            )}

            {product.pricing?.discountPercentage && product.pricing.discountPercentage > 0 && (
              <DiscountBadge
                percentage={product.pricing.discountPercentage}
                className="discount-badge"
              />
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Action buttons */}
        <div className="product-actions">
          <div className="flex items-center gap-4">
            <AddToCartButton
              product={product}
              locale={lang}
              onClick={handleAddToCart}
              className="flex-1 add-to-cart-button"
              showToast={true}
              successMessage={getAddToCartMessage()}
              removeMessage={getRemoveFromCartMessage()}
            />

            <FavoriteButton
              product={product}
              locale={lang}
              size="icon"
              className="h-[40px] w-[40px]"
              showToast={true}
            />

            <ShareButton
              product={product}
              locale={lang}
              size="icon"
              className="h-[40px] w-[40px]"
              description={
                lang === 'ru'
                  ? `Посмотрите этот товар: ${getProductTitle()}`
                  : `Check out this product: ${getProductTitle()}`
              }
              showToastOnCopy={true}
              copyMessage={
                lang === 'ru'
                  ? `Ссылка на ${getProductTitle()} скопирована!`
                  : `Link to ${getProductTitle()} copied!`
              }
            />
          </div>

          {/* Delivery info for digital goods */}
          {product.productType === 'digital' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Download className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500">
                {t.products?.instantDelivery || 'Instant Delivery'}
              </span>
            </div>
          )}
        </div>

        {/* Product information tabs */}
        <div className="mt-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description">{getProductDescriptionLabel()}</TabsTrigger>
              <TabsTrigger value="features">{getFeaturesLabel()}</TabsTrigger>
              <TabsTrigger value="specs">{getSpecificationsLabel()}</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="description-section">
              {product.description ? (
                <div className="prose dark:prose-invert max-w-none">
                  <RichText data={product.description} />
                </div>
              ) : (
                <div className="text-muted-foreground italic">
                  {lang === 'ru' ? 'Описание отсутствует' : 'No description available'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="features" className="features-section">
              {product.features && product.features.length > 0 ? (
                <div className="features-grid">
                  {product.features.map((feature, index) => {
                    // Get the icon based on feature type
                    let Icon = Check
                    // Add null check before toLowerCase to prevent errors
                    const featureText =
                      typeof feature === 'string' ? feature : feature.feature || ''
                    const featureKey = featureText.toLowerCase()

                    switch (featureKey) {
                      case 'instant-delivery':
                      case 'download':
                        Icon = Download
                        break
                      case 'recurring-billing':
                        Icon = RefreshCw
                        break
                      case 'access-control':
                      case 'feature-gating':
                        Icon = Shield
                        break
                      case 'updates':
                        Icon = Zap
                        break
                      case 'booking':
                      case 'scheduling':
                        Icon = Clock
                        break
                      case 'instant-activation':
                        Icon = Zap
                        break
                    }

                    return (
                      <div key={index} className="feature-item">
                        <div className="feature-icon">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span>{typeof feature === 'string' ? feature : feature.feature || ''}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground italic p-4">
                  {lang === 'ru' ? 'Особенности отсутствуют' : 'No features available'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="specs" className="p-4 rounded-md bg-muted/20 mt-4">
              <div className="text-muted-foreground">
                {product.specs ? (
                  <div className="space-y-4">
                    {typeof product.specs === 'object' && !Array.isArray(product.specs) ? (
                      Object.entries(product.specs as Record<string, string>).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}</span>
                            <span>{String(value)}</span>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        {product.specs && <RichText data={product.specs} />}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="italic">
                    {lang === 'ru' ? 'Характеристики отсутствуют' : 'No specifications available'}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Trust badges */}
        {renderTrustBadges()}
      </div>
    </div>
  )
}
