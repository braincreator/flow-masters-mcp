'use client'

import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Shield, Truck } from 'lucide-react'
import RichText from '@/components/RichText'
import { useTranslations } from '@/hooks/useTranslations'
import { useState, useEffect } from 'react'
import { ImageGallery } from '@/components/ProductDetail/ImageGallery'
import './ProductDetail/styles.css'
import { useFavorites } from '@/hooks/useFavorites'
import type { Product as ProductType } from '@/payload-types'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { ShareButton } from '@/components/ui/ShareButton'
import { DiscountBadge, NewBadge } from '@/components/ui/badges'
import { ProductPrice } from '@/components/ui/ProductPrice'
import { type Locale } from '@/constants'

interface ProductDetailProps {
  product: ProductType & {
    productType?: 'physical' | 'digital' | 'subscription' | 'service' | 'access'
    pricing?: {
      basePrice?: number
      finalPrice?: number
      compareAtPrice?: number
      discountPercentage?: number
    }
    digitalContent?: {
      fileSize?: string
    }
    hasFreeDelivery?: boolean
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

  const getProductTitle = () => {
    if (typeof product.title === 'string') {
      return product.title
    }
    return product.title?.[lang] || product.title?.['en'] || ''
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

  // Determine if product has free delivery
  const hasFreeDelivery = product.hasFreeDelivery || product.productType === 'digital'

  return (
    <div className="product-detail-container">
      {/* Image Gallery */}
      <ImageGallery images={formattedImages} className="product-image-gallery" locale={lang} />

      {/* Product Info */}
      <div className="product-info">
        {/* Header section */}
        <div className="product-header">
          {isNew && <NewBadge locale={lang} className="mb-2" />}

          <h1 className="product-title">{getProductTitle()}</h1>

          {/* Instant Delivery for digital products */}
          {product.productType === 'digital' && (
            <div className="flex items-center gap-2 text-sm text-success mt-2">
              <Download className="h-4 w-4" />
              <span>{t.products?.instantDelivery || 'Instant Delivery'}</span>
            </div>
          )}
        </div>

        {/* Price section - используем новый компонент */}
        <div className="mt-6">
          <ProductPrice
            product={product}
            locale={lang}
            size="lg"
            variant="detail"
            showPaymentOptions={true}
          />
        </div>

        <Separator className="my-6" />

        {/* Action buttons */}
        <div className="product-actions">
          <div className="flex items-center gap-4">
            <AddToCartButton
              product={product}
              locale={lang}
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
              showToastOnCopy={true}
              copyMessage={lang === 'ru' ? `Ссылка скопирована!` : `Link copied!`}
            />
          </div>
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
                  {product.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span>{typeof feature === 'string' ? feature : feature.feature || ''}</span>
                    </div>
                  ))}
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

        {/* Simple Trust Badge */}
        <div className="flex items-center gap-3 mt-8 p-4 rounded-lg bg-muted/30">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm">
            {lang === 'ru' ? 'Гарантия 30 дней возврата денег' : '30-day money-back guarantee'}
          </span>
        </div>
      </div>
    </div>
  )
}
