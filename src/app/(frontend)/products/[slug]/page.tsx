import { ProductPrice } from '@/components/ui/ProductPrice'
import { getProduct } from '@/app/(frontend)/[lang]/products/services/productService'
import { useLocale } from 'next-intl'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { locale } = useLocale()
  const productResult = await getProduct({ slug: params.slug, locale })

  // Handle case where product might not be found
  if (!productResult || !productResult.item) {
    // TODO: Implement a proper not found page or handling
    return <div>Product not found</div>
  }

  const product = productResult.item

  return (
    <div className="product-page container mx-auto px-4 py-8">
      {/* TODO: Replace with a proper ProductDetail component if available */}
      <h1>{product.title}</h1>

      <div className="price-section my-4">
        <ProductPrice product={product} locale={locale} size="lg" showDiscountBadge={true} />
      </div>

      {/* Display description - Assuming description is a RichText field */}
      {product.description && (
        <div className="description mt-4">{/* Render RichText here */}</div>
      )}

      {/* Add other product details as needed */}
      {/* Example: Display features */}
      {product.features && product.features.length > 0 && (
        <div className="features mt-6">
          <h2 className="text-xl font-semibold mb-2">Features</h2>
          <ul>
            {product.features.map((feature, index) => (
              <li key={index}>
                <strong>{feature.name}:</strong> {feature.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add to cart button etc. */}
    </div>
  )
}
