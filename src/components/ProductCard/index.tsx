'use client'

import Link from 'next/link'
import { ShoppingCart, Tag } from 'lucide-react'
import type { Product } from '@/payload-types'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card-hover rounded-lg bg-background shadow-sm">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {product.thumbnail ? (
          <Link href={`/products/${product.slug}`}>
            <img
              src={product.thumbnail.url}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-medium hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            {product.pricing?.basePrice ? (
              `$${product.pricing.basePrice}`
            ) : (
              'Price not available'
            )}
          </div>
          {product.status === 'published' && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              Available
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          className="w-full mt-4 bg-primary text-primary-foreground 
                   hover:bg-primary/90 px-4 py-2 rounded-lg
                   transition-all duration-200 active:scale-95
                   flex items-center justify-center gap-2
                   animate-fade-in"
          disabled={product.status !== 'published'}
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
