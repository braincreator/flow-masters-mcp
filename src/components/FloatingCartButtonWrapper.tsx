'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import FloatingCartButton from '@/components/ui/cart/FloatingCartButton'
import { Locale } from '@/constants'

interface FloatingCartButtonWrapperProps {
  locale: Locale
}

export default function FloatingCartButtonWrapper({ locale }: FloatingCartButtonWrapperProps) {
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(true)

  // Don't show on checkout or payment pages
  useEffect(() => {
    const isCheckoutPage = pathname.includes('/checkout')
    const isPaymentPage = pathname.includes('/payment')
    setShouldRender(!isCheckoutPage && !isPaymentPage)
  }, [pathname])

  if (!shouldRender) return null

  return <FloatingCartButton locale={locale} />
}
