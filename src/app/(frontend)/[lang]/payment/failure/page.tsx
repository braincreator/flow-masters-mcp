'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams, useSearchParams } from 'next/navigation'
import { Locale } from '@/constants'

export default function PaymentFailureRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useParams()
  const locale = lang as Locale

  // Get error and orderId from query params
  const error = searchParams.get('error')
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    // Redirect to a cart page with error parameter
    // You may want to create a dedicated payment-failure page similar to payment-success
    router.replace(
      `/${locale}/cart?paymentError=${error || 'Unknown error'}&orderId=${orderId || ''}`,
    )
  }, [router, locale, error, orderId])

  // Show loading state while redirecting
  return (
    <div className="container flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirecting after payment failure...</p>
      </div>
    </div>
  )
}
