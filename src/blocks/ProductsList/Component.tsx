import React from 'react'
import { useLocale } from '@/hooks/useLocale'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'
import { AddToCart } from '@/components/AddToCart'

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { locale } = useLocale()
  const price = getLocalePrice(product, locale)
  const formattedPrice = formatPrice(price, locale)

  return (
    <div className="product-details">
      <h1>{product.title?.[locale] || product.title}</h1>
      <div className="price-section">
        <span className="price">{formattedPrice}</span>
        <AddToCart product={product} />
      </div>
      <div className="description">
        {product.description?.[locale] || product.description}
      </div>
      {/* Additional product details */}
    </div>
  )
}
