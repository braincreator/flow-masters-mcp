'use client'

import { useSearchParams } from 'next/navigation'
import { PaymentResult } from '@/components/PaymentResult'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const transactionId = searchParams.get('transactionId')

  const result = {
    success: true,
    orderId: orderId || 'unknown',
    transactionId,
  }

  return <PaymentResult result={result} />
}
