'use client'

import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utilities/formatPrice'
import { Locale } from '@/constants'

interface CartSummaryProps {
  showItems?: boolean
  locale: Locale
}

export function CartSummary({ showItems = true, locale }: CartSummaryProps) {
  const { items, total, itemCount } = useCart()

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">
        {locale === 'ru' ? 'Итого заказа' : 'Order Summary'}
      </h3>

      {showItems && items.length > 0 && (
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>
                {typeof item.product.title === 'object'
                  ? item.product.title[locale] || item.product.title.en
                  : item.product.title}
                {item.quantity > 1 && ` × ${item.quantity}`}
              </span>
              <span className="font-medium">
                {formatCurrency(
                  (item.product.pricing?.[locale]?.amount ||
                    item.product.pricing?.basePrice ||
                    item.product.price ||
                    0) * (item.quantity || 1),
                  locale,
                )}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 my-2" />
        </div>
      )}

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>{locale === 'ru' ? 'Товары' : 'Items'}</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>{locale === 'ru' ? 'Итого' : 'Total'}</span>
          <span>{formatCurrency(total, locale)}</span>
        </div>
      </div>
    </div>
  )
}
