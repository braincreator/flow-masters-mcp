'use client'

import { useSearchParams } from 'next/navigation'
import PaymentResult, { PaymentResultProps } from '@/components/PaymentResult' // Import the type
import { Locale } from '@/constants' // Assuming Locale type exists

interface PaymentSuccessPageProps {
  params: { lang: Locale }
}

export default function PaymentSuccessPage({ params }: PaymentSuccessPageProps) {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const transactionId = searchParams.get('transactionId')
  const locale = params.lang

  // The old 'result' object is removed as it's not needed

  // Explicitly type the props object
  const paymentResultProps: PaymentResultProps = {
    success: true,
    orderId: orderId,
    transactionId: transactionId,
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
