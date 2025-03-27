'use client'

import React from 'react'
import { useI18n } from '@/providers/I18n'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'
import { AddToCart } from '@/components/AddToCart'
import { ProductType } from '@/types'
import { translations } from '@/app/(frontend)/[lang]/products/translations'

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { lang } = useI18n()
  const t = translations[lang as keyof typeof translations]
  const price = getLocalePrice(product, lang)
  const formattedPrice = formatPrice(price, lang)

  const renderProductTypeSpecificDetails = () => {
    switch (product.productType) {
      case 'digital':
        return (
          <div className="digital-details">
            <span className="instant-delivery">✓ {t.productDetails.instantDelivery}</span>
            {product.digitalContent?.fileSize && (
              <span className="file-size">
                {t.productDetails.fileSize}: {product.digitalContent.fileSize}
              </span>
            )}
          </div>
        )
      case 'subscription':
        return (
          <div className="subscription-details">
            <span className="billing-interval">
              {t.productDetails.billingInterval}: {product.pricing.interval}
            </span>
            <span className="auto-renewal">{t.productDetails.autoRenewal}</span>
          </div>
        )
      case 'service':
        return (
          <div className="service-details">
            <span className="duration">
              {t.productDetails.duration}: {product.serviceDetails.duration}
            </span>
            <span className="location">
              {t.productDetails.location}: {product.serviceDetails.location}
            </span>
          </div>
        )
      case 'access':
        return (
          <div className="access-details">
            <span className="validity">
              {product.accessDetails.validityPeriod
                ? t.productDetails.validity.replace(
                    '{period}',
                    product.accessDetails.validityPeriod.toString(),
                  )
                : t.productDetails.unlimitedAccess}
            </span>
            <div className="features">
              <h4>{t.productDetails.features}:</h4>
              <ul className="features-list">
                {product.accessDetails.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="product-details">
      <h1>{product.title?.[lang] || product.title}</h1>
      <div className="price-section">
        <span className="price">{formattedPrice}</span>
        <AddToCart product={product} />
      </div>
      {renderProductTypeSpecificDetails()}
      <div className="description">{product.description?.[lang] || product.description}</div>
    </div>
  )
}
