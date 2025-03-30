'use client'

import { useSearchParams } from 'next/navigation'
import PaymentResult from '@/components/PaymentResult'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const transactionId = searchParams.get('transactionId')

  const result = {
    success: true,
    orderId: orderId || 'unknown',
    transactionId,
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-lg mx-auto">
        <PaymentResult lang="en" successText="Payment successful!" errorText="Payment failed" />
      </div>
    </div>
  )
}
