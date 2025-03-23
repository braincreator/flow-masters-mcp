import React from 'react'
import { useLocale } from '@/hooks/useLocale'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { locale } = useLocale()
  const price = getLocalePrice(product, locale)
  const formattedPrice = formatPrice(price, locale)

  return (
    <div className="product-card">
      <h3>{product.title?.[locale] || product.title}</h3>
      <p className="price">{formattedPrice}</p>
      {product.pricing?.basePrice && product.pricing?.[locale]?.amount !== product.pricing?.basePrice && (
        <p className="original-price">
          {formatPrice(product.pricing.basePrice, 'en')}
        </p>
      )}
      {/* ... остальной JSX ... */}
    </div>
  )
}