'use client'

import { useSearchParams } from 'next/navigation'
import PaymentResult from '@/components/PaymentResult'

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const error = searchParams.get('error')

  const result = {
    success: false,
    orderId: orderId || 'unknown',
    error: error || 'Payment processing failed',
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-lg mx-auto">
        <PaymentResult lang="en" successText="Payment successful!" errorText="Payment failed" />
      </div>
    </div>
  )
}
