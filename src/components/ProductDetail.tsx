'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Clock, Shield, Star, ShoppingCart, Package, Zap, RefreshCw, ImageIcon } from "lucide-react"
import RichText from "@/components/RichText"
import { useTranslations } from '@/hooks/useTranslations'
import LoadingIndicator from "@/components/ui/LoadingIndicator"
import { useState } from "react"
import Image from "next/image"

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface ProductDetailProps {
  product: {
    title: string | { [key: string]: string }
    category: {
      title: string
      id: string
      [key: string]: any
    } | string
    status: string
    productType: 'digital' | 'subscription' | string
    pricing: {
      finalPrice?: number
      basePrice?: number
      compareAtPrice?: number
      discountPercentage?: number
      interval?: string
    }
    digitalContent?: {
      fileSize?: string
    }
    description: any
    features?: Array<{ feature: string }>
    images?: Array<{ url: string }>
  }
  lang: string
}

export function ProductDetail({ product, lang }: ProductDetailProps) {
  const t = useTranslations(lang)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

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
    switch (product.productType) {
      case 'digital':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Download className="h-4 w-4" />
            <span>{t.products.instantDelivery}</span>
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
            <span>{product.pricing.interval}</span>
            <span className="mx-2">•</span>
            <Shield className="h-4 w-4" />
            <span>{t.products.autoRenewal}</span>
          </div>
        )
      default:
        return null
    }
  }

  const currentImage = product.images?.[selectedImageIndex]?.url

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const renderPlaceholder = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <ImageIcon className="h-10 w-10" />
        <span className="text-sm">No image available</span>
      </div>
    </div>
  )

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden bg-muted/30 ring-1 ring-inset ring-black/10 dark:ring-white/10">
        <div className="relative aspect-square">
          {!currentImage ? (
            renderPlaceholder()
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                  <LoadingIndicator className="h-10 w-10 border-primary/30 border-r-primary" />
                </div>
              )}
              <Image
                src={currentImage}
                alt={getProductTitle()}
                fill
                className={cn(
                  "object-cover transition-opacity duration-300",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={selectedImageIndex === 0}
                onLoad={handleImageLoad}
              />
            </>
          )}
        </div>

        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-4 mt-4 p-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg transition-all duration-300",
                  "hover:ring-2 hover:ring-primary hover:ring-offset-2",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  selectedImageIndex === index && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className="absolute inset-0 bg-muted/30" />
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 25vw, 10vw"
                  className={cn(
                    "object-cover transition-transform duration-300",
                    "group-hover:scale-110"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-8 lg:sticky lg:top-20">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {getCategoryTitle()}
            </Badge>
            {product.status === 'published' && (
              <Badge variant="success">
                {t.products.inStock}
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight">{getProductTitle()}</h1>
          
          {renderProductTypeInfo() && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
              {renderProductTypeInfo()}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative inline-flex items-center group">
            <div className="absolute -inset-4 -skew-x-12 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors duration-300" />
            <span className="text-3xl font-bold relative">
              ${product.pricing?.finalPrice || product.pricing?.basePrice}
            </span>
            {product.pricing?.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through ml-2 relative">
                ${product.pricing.compareAtPrice}
              </span>
            )}
            {product.pricing?.discountPercentage && (
              <Badge variant="destructive" className="ml-3 animate-pulse relative">
                -{product.pricing.discountPercentage}%
              </Badge>
            )}
          </div>
          {product.pricing?.interval && (
            <p className="text-sm text-muted-foreground">
              {t.productDetails.billingInterval}: {product.pricing.interval}
            </p>
          )}
        </div>

        <Separator />

        {product.description && (
          <div className="prose dark:prose-invert max-w-none bg-muted/30 rounded-xl p-6">
            <RichText data={product.description} />
          </div>
        )}

        {product.features && product.features.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {t.productDetails?.features || 'Features'}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.features.map((feature, index) => (
                <div key={index} 
                     className="flex items-center gap-3 rounded-xl p-4 bg-muted/30 backdrop-blur-sm transition-all duration-200 hover:bg-muted/50">
                  <Star className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 p-1.5 text-primary" />
                  <span>{feature.feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 mt-8">
          <Button 
            size="lg" 
            className="w-full relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl p-4 bg-muted/50 backdrop-blur-sm transition-all duration-300 hover:bg-muted/70">
            <Package className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 p-2 text-primary" />
            <div>
              <h4 className="font-medium">Free Shipping</h4>
              <p className="text-sm text-muted-foreground">On all orders over $50</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl p-4 bg-muted/50 backdrop-blur-sm transition-all duration-300 hover:bg-muted/70">
            <Zap className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 p-2 text-primary" />
            <div>
              <h4 className="font-medium">Instant Access</h4>
              <p className="text-sm text-muted-foreground">Download immediately</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl p-4 bg-muted/50 backdrop-blur-sm transition-all duration-300 hover:bg-muted/70">
            <RefreshCw className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 p-2 text-primary" />
            <div>
              <h4 className="font-medium">Free Updates</h4>
              <p className="text-sm text-muted-foreground">Lifetime access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
