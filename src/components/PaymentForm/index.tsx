'use client'

import React from 'react'
import { usePayment } from '@/hooks/usePayment'
import { PaymentFormData, PaymentProvider } from '@/types/payment'
import { PAYMENT_CONFIG } from '@/constants/payment'

interface PaymentFormProps {
  orderId: string
  amount: number
  currency: string
  description: string
  customerEmail: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  currency,
  description,
  customerEmail,
  onSuccess,
  onError,
}) => {
  const {
    isLoading,
    error,
    initiatePayment,
    getAvailableProviders,
  } = usePayment({
    orderId,
    amount,
    currency,
    description,
    customerEmail,
  })

  const handlePaymentSubmit = async (provider: PaymentProvider) => {
    try {
      await initiatePayment(provider)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      onError?.(errorMessage)
    }
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Payment Method</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getAvailableProviders().map((provider) => (
          <button
            key={provider}
            onClick={() => handlePaymentSubmit(provider)}
            disabled={isLoading}
            className={`
              p-4 border rounded-lg text-left
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
            `}
          >
            <div className="font-medium">
              {PAYMENT_CONFIG.providers[provider].name}
            </div>
            <div className="text-sm text-gray-500">
              Pay with {PAYMENT_CONFIG.providers[provider].name}
            </div>
          </button>
        ))}
      </div>
      {isLoading && (
        <div className="text-center text-gray-500">
          Processing payment...
        </div>
      )}
    </div>
  )
}