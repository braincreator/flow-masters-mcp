'use client'

import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Plus, Minus } from 'lucide-react'

/**
 * Test component to verify cart count updates correctly
 */
export function CartCounter() {
  const { addToCart, removeFromCart, itemCount, items } = useCart()

  // Simple mock product for testing
  const testProduct = {
    id: 'test-product-1',
    title: 'Test Product',
    price: 9.99,
  }

  const handleAddToCart = () => {
    addToCart(testProduct as any)
  }

  const handleRemoveFromCart = () => {
    removeFromCart(testProduct.id)
  }

  return (
    <div className="fixed bottom-8 left-8 z-50 bg-background border border-border rounded-lg p-4 shadow-lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-medium">Cart Count: {itemCount}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAddToCart} className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveFromCart}
            className="flex items-center gap-1"
          >
            <Minus className="w-4 h-4" /> Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
