'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Download, Clock, Shield, Tag } from 'lucide-react'
import type { Product } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/utilities/formatPrice'
import { type Locale } from '@/constants'

interface ProductCardProps {
  product: Product
  locale: Locale
  layout?: 'grid' | 'list'
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, locale, layout = 'grid', onAddToCart }: ProductCardProps) {
  const getButtonConfig = (type: string) => {
    switch (type) {
      case 'digital':
        return {
          text: locale === 'ru' ? 'Купить' : 'Buy Now',
          icon: Download
        }
      case 'subscription':
        return {
          text: locale === 'ru' ? 'Подписаться' : 'Subscribe',
          icon: Clock
        }
      case 'service':
        return {
          text: locale === 'ru' ? 'Заказать услугу' : 'Book Service',
          icon: Clock
        }
      case 'access':
        return {
          text: locale === 'ru' ? 'Получить доступ' : 'Get Access',
          icon: Shield
        }
      default:
        return {
          text: locale === 'ru' ? 'В корзину' : 'Add to Cart',
          icon: ShoppingCart
        }
    }
  }

  const buttonConfig = getButtonConfig(product.productType)
  const ButtonIcon = buttonConfig.icon

  return (
    <div
      className={`group bg-card rounded-xl border border-border overflow-hidden
        transition-all duration-300 hover:shadow-lg
        ${layout === 'list' ? 'flex gap-6' : 'flex flex-col'}
      `}
    >
      {/* Image Container */}
      <Link 
        href={`/${locale}/products/${product.slug}`}
        className={`
          relative overflow-hidden
          ${layout === 'list' ? 'w-48 h-48 shrink-0' : 'w-full aspect-[4/3]'}
        `}
      >
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.alt || product.title}
            fill
            sizes={layout === 'list' ? '200px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        
        {/* Price Badge */}
        {product.pricing?.[locale]?.amount && (
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm 
                        px-3 py-1 rounded-full border border-border">
            <span className="font-semibold">
              {formatPrice(product.pricing[locale].amount, locale)}
            </span>
          </div>
        )}
      </Link>
      
      {/* Content */}
      <div className="flex flex-col flex-grow p-4 space-y-4">
        {/* Title */}
        <Link 
          href={`/${locale}/products/${product.slug}`}
          className="group-hover:text-primary transition-colors"
        >
          <h2 className="text-xl font-semibold line-clamp-2">
            {typeof product.title === 'object' ? product.title[locale] : product.title}
          </h2>
        </Link>
        
        {/* Description */}
        {product.description && (
          <p className="line-clamp-3 text-muted-foreground">
            {typeof product.description === 'object' 
              ? product.description[locale] 
              : product.description}
          </p>
        )}
        
        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.categories.map((category) => (
              <span 
                key={category.id}
                className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-full"
              >
                {typeof category.title === 'object' 
                  ? category.title[locale] 
                  : category.title}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onAddToCart?.(product)}
          className="w-full glass-effect interactive-element
                   relative overflow-hidden group/button
                   hover:border-primary/30 mt-auto"
          disabled={product.status !== 'published'}
          size="lg"
        >
          <ButtonIcon className="w-5 h-5 mr-2" />
          {buttonConfig.text}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                       via-white/20 to-transparent opacity-0 
                       group-hover/button:opacity-100 transition-opacity duration-300 
                       -translate-x-full group-hover/button:translate-x-full" />
        </Button>

        {/* Subscription Info */}
        {product.productType === 'subscription' && product.pricing?.interval && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{product.pricing.interval}</span>
            <span className="mx-2">•</span>
            <Shield className="h-4 w-4" />
            <span>{locale === 'ru' ? 'Автопродление' : 'Auto-renewal'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
