'use client'

import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utilities/formatCurrency'

interface CartSummaryProps {
  showItems?: boolean
}

export function CartSummary({ showItems = true }: CartSummaryProps) {
  const { items, total, itemCount } = useCart()

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      {showItems && items.length > 0 && (
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>
                {item.product.title} × {item.quantity}
              </span>
              <span className="font-medium">
                {formatCurrency(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 my-2" />
        </div>
      )}

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}