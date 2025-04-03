'use client'

import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'
import { Product } from '@/payload-types'
import { Skeleton } from '@/components/ui/skeleton'

interface CartSummaryProps {
  showItems?: boolean
  locale: Locale
}

export function CartSummary({ showItems = true, locale }: CartSummaryProps) {
  const { items, total, itemCount, isLoading, error } = useCart(locale)

  if (isLoading) {
    return <CartSummarySkeleton showItems={showItems} />
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-destructive">
        {locale === 'ru' ? 'Ошибка загрузки итогов' : 'Error loading summary'}
      </div>
    )
  }

  if (itemCount <= 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-muted-foreground">
        {locale === 'ru' ? 'Корзина пуста' : 'Cart is empty'}
      </div>
    )
  }

  const getProductTitle = (itemProduct: string | Product | null | undefined): string => {
    if (typeof itemProduct === 'object' && itemProduct?.title) {
      const title = itemProduct.title
      return typeof title === 'object' ? title[locale] || title.en || 'Product' : title
    }
    return 'Product'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">
        {locale === 'ru' ? 'Итого заказа' : 'Order Summary'}
      </h3>

      {showItems && items.length > 0 && (
        <div className="space-y-2 mb-4">
          {items.map((item) => {
            const itemPrice = item.price
            const productId = typeof item.product === 'string' ? item.product : item.product?.id
            if (!productId) return null

            return (
              <div key={productId} className="flex justify-between text-sm">
                <span>
                  {getProductTitle(item.product)}
                  {item.quantity > 1 && ` × ${item.quantity}`}
                </span>
                <span className="font-medium">
                  {formatPrice(itemPrice * item.quantity, locale)}
                </span>
              </div>
            )
          })}
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
          <span>{formatPrice(total, locale)}</span>
        </div>
      </div>
    </div>
  )
}

function CartSummarySkeleton({ showItems }: { showItems?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <Skeleton className="h-6 w-1/2" />
      {showItems && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-1/5" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      )}
      <div className="space-y-1">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/6" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
    </div>
  )
}
