'use client'

import React, { useState, useEffect, use } from 'react'
// import { Cart } from '@/components/Cart' // Replaced with DetailedCartItemsList
import { DetailedCartItemsList, CartItemType } from '@/components/Cart/DetailedCartItemsList'
import { useCart } from '@/providers/CartProvider'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button' // Assuming a Button component exists
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation' // For navigation
import { Locale } from '@/constants'

// Helper to simulate modal behavior; in a real app, you might use a portal or a dedicated modal library.
// For this example, we'll just render it directly but control its visibility.
// We'll also assume this page is accessed in a way that it *acts* as a modal overlay.

export default function CartModalPage({ params: paramsProp }: { params: { lang: Locale } }) {
  // Assuming paramsProp could be a Promise as per Next.js evolving patterns
  const params = use(paramsProp as any) as { lang: Locale };
  const lang = params.lang;
  const t = useTranslations('Cart')
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(true) // Modal is open by default when page is visited

  const {
    cart,
    remove: removeFromCart,
    updateItem,
    itemsLoading,
    total, // Get total for disabling checkout if cart is empty
  } = useCart()

  const currentCartItems: CartItemType[] = cart?.items || []

  // Effect to handle body scroll lock when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto' // Cleanup on unmount
    }
  }, [isModalOpen])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Redirect to home or previous page when modal is closed
    // For simplicity, redirecting to home.
    router.push(`/${lang}`)
  }

  const handleContinueShopping = () => {
    handleCloseModal()
  }

  const handleCheckout = () => {
    // Navigate to the actual checkout page
    router.push(`/${lang}/checkout`) // Assuming a checkout page exists at this path
  }

  if (!isModalOpen) {
    return null // Or a redirect, handled by handleCloseModal
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{t('title')}</h2>
          <Button variant="ghost" size="icon" onClick={handleCloseModal} aria-label={t('closeButton')} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-y-auto flex-grow mb-6 pr-2">
          <DetailedCartItemsList
            items={currentCartItems}
            locale={lang}
            removeFromCart={removeFromCart}
            updateItem={updateItem}
            itemsLoading={itemsLoading}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t pt-4">
          <Button variant="outline" onClick={handleContinueShopping}>
            {t('continueShoppingButton')}
          </Button>
          <Button onClick={handleCheckout} disabled={currentCartItems.length === 0}>
            {t('checkoutButton')}
          </Button>
        </div>
      </div>
    </div>
  )
}