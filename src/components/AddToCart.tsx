import { useCart } from '@/hooks/useCart'
import { Product, ProductType } from '@/types'
import { useI18n } from '@/providers/I18n'
import { translations } from '@/app/(frontend)/[lang]/products/translations'

export const AddToCart: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart()
  const { lang } = useI18n()
  const t = translations[lang as keyof typeof translations]

  const getButtonText = (type: ProductType) => {
    switch (type) {
      case 'digital':
        return t.buttons.buyNow
      case 'subscription':
        return t.buttons.subscribe
      case 'service':
        return t.buttons.bookService
      case 'access':
        return t.buttons.getAccess
      default:
        return t.buttons.buyNow
    }
  }

  return (
    <button 
      onClick={() => addToCart(product)}
      className={`add-to-cart-button ${product.productType}`}
    >
      {getButtonText(product.productType)}
    </button>
  )
}
