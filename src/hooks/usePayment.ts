'use client'

import { useState, useCallback } from 'react'
import { PaymentProvider } from '@/types/constants'
import { PAYMENT_CONFIG } from '@/constants/payment'
import { paymentService } from '@/services/payment'

interface UsePaymentProps {
  orderId: string
  amount: number
  currency: string
  description: string
  customerEmail: string
}

export const usePayment = ({
  orderId,
  amount,
  currency,
  description,
  customerEmail,
}: UsePaymentProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAvailableProviders = useCallback((): PaymentProvider[] => {
    return Object.entries(PAYMENT_CONFIG.providers)
      .filter(([_, config]) => config.enabled)
      .map(([provider]) => provider as PaymentProvider)
  }, [])

  const initiatePayment = useCallback(
    async (provider: PaymentProvider) => {
      setIsLoading(true)
      setError(null)

      try {
        const paymentResult = await paymentService.createPayment(provider, {
          orderId,
          amount,
          currency,
          description,
          customer: {
            email: customerEmail,
          },
          locale: 'ru', // Could be made dynamic based on user preference
        })

        if (!paymentResult.success || !paymentResult.paymentUrl) {
          throw new Error(paymentResult.error || 'Failed to create payment')
        }

        // Redirect to payment page
        window.location.href = paymentResult.paymentUrl
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment initialization failed')
        setIsLoading(false)
      }
    },
    [orderId, amount, currency, description, customerEmail],
  )

  return {
    isLoading,
    error,
    initiatePayment,
    getAvailableProviders,
  }
}
