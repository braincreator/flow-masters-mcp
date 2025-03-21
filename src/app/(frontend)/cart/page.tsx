import { Cart } from '@/components/Cart'

export const metadata = {
  title: 'Shopping Cart',
  description: 'View your shopping cart and proceed to checkout',
}

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <Cart />
    </div>
  )
}