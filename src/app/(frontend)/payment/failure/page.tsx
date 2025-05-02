'use client'

import { useSearchParams } from 'next/navigation'
import PaymentResult, { PaymentResultProps } from '@/components/PaymentResult' // Use relative path
import { Locale } from '@/constants' // Assuming Locale type exists

interface PaymentFailurePageProps {
  params: { lang: Locale }
}

export default function PaymentFailurePage({ params }: PaymentFailurePageProps) {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const error = searchParams.get('error') // Get error message from URL
  const locale = params.lang

  // Explicitly type the props object
  const paymentResultProps: PaymentResultProps = {
    success: false,
    orderId: orderId,
    errorMessage: error || undefined, // Pass the error message from URL
    locale: locale,
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-lg mx-auto">
        {/* Pass correct props to PaymentResult using spread */}
        <PaymentResult {...paymentResultProps} />
      </div>
    </div>
  )
}
