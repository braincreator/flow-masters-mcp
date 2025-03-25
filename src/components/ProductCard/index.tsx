import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Tag, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ProductCard = ({ product, onAddToCart }) => {
  const isDiscounted = product.discountPrice && product.discountPrice < product.price
  
  return (
    <div className="product-card">
      {/* Image Container */}
      <div className="product-card-image">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Price Badge */}
        <div className="product-card-badge">
          {isDiscounted && (
            <div className="product-card-price-discount">
              ${product.price}
            </div>
          )}
          <div className="product-card-price">
            ${isDiscounted ? product.discountPrice : product.price}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="product-card-content">
        <Link href={`/products/${product.slug}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>
        
        <p className="product-card-description">
          {product.description}
        </p>

        {/* Tags */}
        <div className="product-card-tags">
          {product.tags?.map((tag, index) => (
            <span key={index} className="product-card-tag">
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          className="w-full mt-4 bg-primary text-primary-foreground 
                   hover:bg-primary/90 px-4 py-2 rounded-lg
                   transition-all duration-200 active:scale-95
                   flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
