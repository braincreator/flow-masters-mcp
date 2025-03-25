import { useLocale } from '@/hooks/useLocale'
import { PRODUCT_TYPE_LABELS, PRODUCT_FEATURE_LABELS } from '@/constants/localization'
import { getProductConfig } from '@/constants/payment'

interface ProductTypeProps {
  type: string
  className?: string
}

export const ProductType: React.FC<ProductTypeProps> = ({ type, className = '' }) => {
  const { locale } = useLocale()
  const config = getProductConfig(locale)
  const productType = config.types[type]

  if (!productType) {
    return null
  }

  return (
    <div className={`product-type ${className}`}>
      <span className="label">{productType.label}</span>
      <div className="features">
        {productType.features.map(({ key, label }) => (
          <span key={key} className="feature">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
