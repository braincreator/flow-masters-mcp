'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams, useSearchParams } from 'next/navigation'
import { Locale } from '@/constants'

export default function PaymentSuccessRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useParams()
  const locale = lang as Locale

  // Get orderId from query params
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    // Redirect to the payment-success page with the order parameter
    router.replace(`/${locale}/payment-success?order=${orderId || ''}`)
  }, [router, locale, orderId])

  // Show loading state while redirecting
  return (
    <div className="container flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirecting to payment confirmation page...</p>
      </div>
    </div>
  )
}
