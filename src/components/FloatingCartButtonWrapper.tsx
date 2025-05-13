'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import FloatingCartButton from '@/components/ui/cart/FloatingCartButton'
import { Locale } from '@/constants'
import { useCart } from '@/providers/CartProvider'

interface FloatingCartButtonWrapperProps {
  locale: Locale
}

export default function FloatingCartButtonWrapper({ locale }: FloatingCartButtonWrapperProps) {
  const pathname = usePathname()
  const { items = [] } = useCart()
  const [shouldRender, setShouldRender] = useState(false)

  // Don't show on checkout or payment pages
  useEffect(() => {
    const isCheckoutPage = pathname.includes('/checkout')
    const isPaymentPage = pathname.includes('/payment')
    const hasItemsInCart = items.length > 0

    setShouldRender(!isCheckoutPage && !isPaymentPage && hasItemsInCart)
  }, [pathname, items])

  if (!shouldRender) return null

  return <FloatingCartButton locale={locale} />
}
