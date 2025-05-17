'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart, CartItemType } from '@/providers/CartProvider'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ModalDialog } from '@/components/ui/modal-dialog'
import { useState, useCallback } from 'react'
import { formatPrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'
import { Product } from '@/payload-types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'
import { Checkout } from '@/components/Checkout' // Import Checkout component
import { DetailedCartItemsList, CartItemType as DetailedCartItem } from './Cart/DetailedCartItemsList' // Import DetailedCartItemsList

interface CartProps {
  locale: Locale
}

export function Cart({ locale }: CartProps) {
  const t = useTranslations('Cart')
  const {
    cart,
    itemCount,
    total,
    isLoading,
    error,
    removeItem,
    updateItem,
    emptyCart,
    refreshCart,
    closeCartModal, // Get closeModal function
  } = useCart()

  type CartView = 'items' | 'checkout' | 'confirmation'
  const [currentView, setCurrentView] = useState<CartView>('items')

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<{ id: string; itemType: CartItemType } | null>(
    null,
  )
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  const handleCheckoutSuccess = useCallback(() => {
    setCurrentView('confirmation')
    // Optionally, clear cart or perform other actions
    // emptyCart(); // Example: clear cart on successful checkout
  }, [])

  const handleGoToCheckout = () => {
    setCurrentView('checkout')
  }

  const handleBackToItems = () => {
    setCurrentView('items')
  }

  if (isLoading) {
    return <CartSkeleton />
  }

  if (error) {
    return (
      <Card className="text-center py-12 text-destructive">
        <h2 className="text-2xl font-bold mb-4">{t('errorTitle')}</h2>
        <p>{error.message || t('errorDescriptionDefault')}</p>
        <Button onClick={() => refreshCart()} variant="outline" className="mt-4">
          {t('tryAgainButton')}
        </Button>
      </Card>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('emptyTitle')}</h2>
        <Button variant="default" onClick={closeCartModal}>
          {t('continueShoppingButton')}
        </Button>
      </Card>
    )
  }

  const handleRemoveClick = (productId: string, itemType: CartItemType) => {
    setItemToRemove({ id: productId, itemType })
    setRemoveModalOpen(true)
  }

  const confirmRemove = async () => {
    if (!itemToRemove) return
    setUpdatingItemId(itemToRemove.id)
    setRemoveModalOpen(false)
    try {
      await removeItem(itemToRemove.id, itemToRemove.itemType)
    } finally {
      setItemToRemove(null)
      setUpdatingItemId(null)
    }
  }

  const handleQuantityChange = async (
    productId: string,
    itemType: CartItemType,
    newQuantityStr: string,
  ) => {
    const newQuantity = parseInt(newQuantityStr, 10)
    if (isNaN(newQuantity) || newQuantity < 0) return

    setUpdatingItemId(productId)
    try {
      if (newQuantity === 0) {
        await removeItem(productId, itemType)
      } else {
        await updateItem(productId, itemType, newQuantity)
      }
    } finally {
      setUpdatingItemId(null)
    }
  }

  const getProductTitle = (itemProduct: string | Product | null | undefined): string => {
    if (typeof itemProduct === 'object' && itemProduct && typeof itemProduct.title !== 'undefined') {
      const title = itemProduct.title
      // Check if title is a localized object (and not null)
      if (typeof title === 'object' && title !== null) {
        const localizedTitle = title as { [key: string]: string } // Type assertion
        if (locale in localizedTitle && typeof localizedTitle[locale] === 'string') {
          return localizedTitle[locale]
        }
        // Fallback to 'en' if current locale is not present
        if ('en' in localizedTitle && typeof localizedTitle.en === 'string') {
          return localizedTitle.en
        }
        // If it's an object but doesn't have locale or 'en', or they are not strings, fallback
        return t('productFallbackTitle')
      }
      // If title is a simple string
      if (typeof title === 'string') {
        return title
      }
    }
    return t('productFallbackTitle')
  }

  const getProductSlug = (itemProduct: string | Product | null | undefined): string | null => {
    if (typeof itemProduct === 'object' && itemProduct?.slug) {
      return typeof itemProduct.slug === 'string' ? itemProduct.slug : itemProduct.slug[0] || null
    }
    return null
  }

  const getProductImageUrl = (itemProduct: string | Product | null | undefined): string => {
    if (typeof itemProduct === 'object' && itemProduct?.thumbnail) {
      const thumbnail = itemProduct.thumbnail
      return typeof thumbnail === 'object' ? thumbnail.url || '' : thumbnail || ''
    }
    return ''
  }

  return (
    <div className="space-y-8">
      {currentView === 'items' && cart && cart.items && (
        <>
          <DetailedCartItemsList
            items={cart.items as DetailedCartItem[]} // Cast to DetailedCartItem[]
            locale={locale}
            removeFromCart={removeItem} // Pass the original removeItem
            updateItem={updateItem} // Pass the original updateItem
            // Pass isItemUpdating if DetailedCartItemsList needs it
            // isItemUpdating={(itemId, itemType) => updatingItemId === itemId} // Example
          />
          <Card className="p-6 mt-8"> {/* Added mt-8 for spacing */}
            <div className="flex justify-between text-xl font-bold mb-4">
              <span>{t('totalLabel')}</span>
              <span>{formatPrice(total, locale)}</span>
            </div>

            <Button className="w-full" size="lg" onClick={handleGoToCheckout}>
              {t('checkoutButton')}
            </Button>
          </Card>
        </>
      )}

      {currentView === 'checkout' && (
        <Checkout
          locale={locale}
          onBack={handleBackToItems}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      )}

      {currentView === 'confirmation' && (
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{t('checkoutSuccessTitle', { defaultValue: 'Checkout Successful!' })}</h2>
          <p className="mb-6">{t('checkoutSuccessMessage', { defaultValue: 'Your order has been placed.' })}</p>
          <Button variant="default" onClick={closeCartModal}>
            {t('continueShoppingButton')}
          </Button>
        </Card>
      )}

      <ModalDialog
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title={t('removeModalTitle')}
        description={t('removeModalDescription')}
        actions={[
          {
            label: t('cancelButton'),
            onClick: () => setRemoveModalOpen(false),
            variant: 'outline',
          },
          {
            label: t('removeButton'),
            onClick: confirmRemove,
            variant: 'destructive',
          },
        ]}
      />
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-24 rounded-md" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-20 h-10" />
                <Skeleton className="w-10 h-10 rounded-md" />
              </div>
              <Skeleton className="h-6 w-1/5" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-7 w-1/4" />
          <Skeleton className="h-7 w-1/5" />
        </div>
        <Skeleton className="h-12 w-full" />
      </Card>
    </div>
  )
}
