import { formatPriceAsync, getLocalePrice } from '@/utilities/formatPrice'

export default async function ProductPage({ params }) {
  const { locale } = useLocale()
  const product = await getProduct(params.slug)

  const price = getLocalePrice(product, locale)
  const formattedPrice = await formatPriceAsync(price, locale)

  return (
    <div className="product-page">
      <h1>{product.title?.[locale]}</h1>
      <div className="product-price">
        {formattedPrice}
        {product.pricing?.basePrice &&
          product.pricing?.[locale]?.amount !== product.pricing?.basePrice && (
            <span className="original-price">
              {await formatPriceAsync(product.pricing.basePrice, 'en')}
            </span>
          )}
      </div>
      {/* Rest of the component */}
    </div>
  )
}
