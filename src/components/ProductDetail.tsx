'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Download,
  FileText,
  Clock,
  Shield,
  Star,
  ShoppingCart,
  Package,
  Zap,
  RefreshCw,
  ImageIcon,
  Check,
  Heart,
  Share2,
  Truck,
  Info,
} from 'lucide-react'
import RichText from '@/components/RichText'
import { useTranslations } from '@/hooks/useTranslations'
import LoadingIndicator from '@/components/ui/LoadingIndicator'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ImageGallery } from '@/components/ProductDetail/ImageGallery'
import './ProductDetail/styles.css'
import { useFavorites } from '@/hooks/useFavorites'
import { SocialSharePopover } from '@/components/ui/SocialSharePopover'
import { toast } from 'sonner'
import type { Product as ProductType } from '@/payload-types'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { ShareButton } from '@/components/ui/ShareButton'

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface ProductDetailProps {
  product: ProductType
  lang: string
}

// Text constants for fallback translations
const TEXT = {
  ADD_TO_CART: 'Add to Cart',
  FREE_SHIPPING: 'Free shipping available',
  DESCRIPTION: 'Description',
  FEATURES: 'Features',
  SPECIFICATIONS: 'Specifications',
  SECURE_PACKAGING: 'Secure Packaging',
  SAFE_DELIVERY: 'Safe delivery',
  GUARANTEE: 'Guarantee',
  DAYS_MONEY: '30-day money back',
  SUPPORT: 'Support',
  HELP_AVAILABLE: 'Help available',
  INSTANT_DELIVERY: 'Instant Delivery',
  AUTO_RENEWAL: 'Auto-renewal',
}

export function ProductDetail({ product, lang }: ProductDetailProps) {
  const t = useTranslations(lang)
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (product?.id) {
      setIsFav(isFavorite(product.id))
    }
  }, [product?.id, isFavorite])

  const getCategoryTitle = () => {
    if (typeof product.category === 'string') {
      return product.category
    }
    return product.category?.title || ''
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
            <span>{t.products?.instantDelivery || TEXT.INSTANT_DELIVERY}</span>
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
            <span>{t.products?.autoRenewal || TEXT.AUTO_RENEWAL}</span>
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

  // Text for the image placeholder
  const noImageText = lang === 'ru' ? 'Изображение отсутствует' : 'No image available'

  // Product page URL for sharing
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${lang}/products/${product.slug || ''}`
      : ''

  // Get featured image URL for sharing
  const getImageUrl = (item: any) => {
    if (typeof item === 'string') return item
    return item?.url || ''
  }

  const featuredImageUrl =
    product.gallery && product.gallery.length > 0
      ? getImageUrl(product.gallery[0].image)
      : getImageUrl(product.thumbnail)

  const handleAddToCart = (productToAdd: any) => {
    // Implement add to cart functionality
    console.log('Adding to cart:', productToAdd)
    // You could call useCart hook or dispatch an action here
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

  return (
    <div className="product-detail-container">
      {/* Image Gallery - Use the updated ImageGallery component which handles no images */}
      <ImageGallery images={formattedImages} className="product-image-gallery" locale={lang} />

      {/* Product Info */}
      <div className="product-info">
        {/* Header section */}
        <div className="product-header">
          <div className="badges-container">
            <Badge variant="outline" className="rounded-md">
              {getCategoryTitle()}
            </Badge>

            {product.tags &&
              product.tags.length > 0 &&
              product.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="rounded-md">
                  {typeof tag === 'string' ? tag : tag.tag}
                </Badge>
              ))}

            {product.rating && (
              <Badge variant="secondary" className="ml-auto flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span>{product.rating.toFixed(1)}</span>
              </Badge>
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
              ${product.pricing?.finalPrice || product.pricing?.basePrice || product.price}
            </span>

            {product.pricing?.compareAtPrice && (
              <span className="original-price">${product.pricing.compareAtPrice}</span>
            )}

            {product.pricing?.discountPercentage && (
              <Badge variant="destructive" className="discount-badge">
                Save {product.pricing.discountPercentage}%
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Action buttons - Replace with new components */}
        <div className="product-actions">
          <div className="flex items-center gap-4">
            <AddToCartButton
              product={product}
              locale={lang as any}
              onClick={handleAddToCart}
              className="flex-1"
              showToast={true}
              successMessage={getAddToCartMessage()}
              removeMessage={getRemoveFromCartMessage()}
            />

            <FavoriteButton
              product={product}
              locale={lang as any}
              size="icon"
              className="h-[40px] w-[40px]"
              showToast={true}
            />

            <ShareButton
              product={product}
              locale={lang as any}
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
              <Download className="h-4 w-4" />
              <span>{t.products?.instantDelivery || TEXT.INSTANT_DELIVERY}</span>
            </div>
          )}
        </div>

        {/* Product information tabs */}
        <div className="mt-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description">{TEXT.DESCRIPTION}</TabsTrigger>
              <TabsTrigger value="features">{TEXT.FEATURES}</TabsTrigger>
              <TabsTrigger value="specs">{TEXT.SPECIFICATIONS}</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="description-section">
              {product.description ? (
                <div className="prose dark:prose-invert max-w-none">
                  <RichText data={product.description} />
                </div>
              ) : (
                <div className="text-muted-foreground italic">No description available</div>
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
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span>{typeof feature === 'string' ? feature : feature.feature || ''}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground italic">No features available</div>
              )}
            </TabsContent>

            <TabsContent value="specs" className="p-4 rounded-md bg-muted/20 mt-4">
              <div className="text-muted-foreground">
                {product.specs ? (
                  <div className="space-y-4">
                    {/* Implement specs rendering here */}
                    <p>Product specifications would be displayed here.</p>
                  </div>
                ) : (
                  <div className="italic">No specifications available</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Trust badges */}
        <div className="product-benefits">
          <div className="benefit-card">
            <Package className="benefit-icon" />
            <div>
              <h4 className="font-medium">{TEXT.SECURE_PACKAGING}</h4>
              <p className="text-xs text-muted-foreground">{TEXT.SAFE_DELIVERY}</p>
            </div>
          </div>

          <div className="benefit-card">
            <Shield className="benefit-icon" />
            <div>
              <h4 className="font-medium">{TEXT.GUARANTEE}</h4>
              <p className="text-xs text-muted-foreground">{TEXT.DAYS_MONEY}</p>
            </div>
          </div>

          <div className="benefit-card">
            <Info className="benefit-icon" />
            <div>
              <h4 className="font-medium">{TEXT.SUPPORT}</h4>
              <p className="text-xs text-muted-foreground">{TEXT.HELP_AVAILABLE}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
