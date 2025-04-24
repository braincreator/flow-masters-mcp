'use client'

import React from 'react'
import { usePayment } from '@/hooks/usePayment'
import { PaymentProvider } from '@/types/constants'
import { PAYMENT_CONFIG } from '@/constants/payment'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

interface PaymentFormProps {
  orderId: string
  amount: number
  currency: string
  description: string
  customerEmail: string
  className?: string
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  currency,
  description,
  customerEmail,
  className,
}) => {
  const { isLoading, error, initiatePayment, getAvailableProviders } = usePayment({
    orderId,
    amount,
    currency,
    description,
    customerEmail,
  })

  const availableProviders = getAvailableProviders()

  const handlePaymentSelect = async (provider: PaymentProvider) => {
    await initiatePayment(provider)
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableProviders.map((provider) => {
          const config = PAYMENT_CONFIG.providers[provider]

          return (
            <Card
              key={provider}
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handlePaymentSelect(provider)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 relative">
                  <Image src={config.icon} alt={config.name} fill className="object-contain" />
                </div>
                <div>
                  <h3 className="font-medium">{config.name}</h3>
                  <p className="text-sm text-gray-500">Pay with {config.name}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-6">
        <div className="text-sm text-gray-500">
          Total amount: {amount} {currency}
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="mt-2 text-center">Processing payment...</p>
          </div>
        </div>
      )}
    </div>
  )
}
