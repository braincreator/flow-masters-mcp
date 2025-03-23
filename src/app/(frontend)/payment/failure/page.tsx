'use client'

import { useSearchParams } from 'next/navigation'
import { PaymentResult } from '@/components/PaymentResult'

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const error = searchParams.get('error')

  const result = {
    success: false,
    orderId: orderId || 'unknown',
    error: error || 'Payment processing failed',
  }

  return <PaymentResult result={result} />
}
