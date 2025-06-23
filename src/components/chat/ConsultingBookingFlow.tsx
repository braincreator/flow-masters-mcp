'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import CalendlyBooking from './CalendlyBooking'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type ConsultingBookingFlowProps = {
  username: string
  eventType: string
  consultingProductId: string
  price: number
  currency?: string
  prefill?: {
    name?: string
    email?: string
    customAnswers?: Record<string, string>
  }
  className?: string
}

export const ConsultingBookingFlow: React.FC<ConsultingBookingFlowProps> = ({
  username,
  eventType,
  consultingProductId,
  price,
  currency = 'USD',
  prefill,
  className = '',
}) => {
  const t = useTranslations('ConsultingBooking')
  const [step, setStep] = useState<'payment' | 'booking'>('payment')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentVerified, setPaymentVerified] = useState(false)

  // Verify payment status if we have an orderId
  useEffect(() => {
    if (orderId && !paymentVerified) {
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`/api/v1/booking/verify-payment?orderId=${orderId}`)
          if (!response.ok) {
            throw new Error('Failed to verify payment status')
          }

          const data = await response.json()
          if (data.verified) {
            setPaymentVerified(true)
            setStep('booking')
          }
        } catch (err) {
          logError('Error verifying payment:', err)
        }
      }

      // Check immediately and then every 5 seconds
      checkPaymentStatus()
      const interval = setInterval(checkPaymentStatus, 5000)

      return () => clearInterval(interval)
    }
  }, [orderId, paymentVerified])

  const handleInitiatePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First, try to find a consulting product if we're using the special ID
      let actualProductId = consultingProductId

      if (consultingProductId === 'consulting-product') {
        // Fetch consulting products
        const productsResponse = await fetch('/api/v1/setup/consulting-product')

        if (!productsResponse.ok) {
          throw new Error('Failed to get consulting product')
        }

        const productData = await productsResponse.json()

        if (!productData.success || !productData.productId) {
          throw new Error('No consulting product available')
        }

        actualProductId = productData.productId
      }

      // Create an order and initiate payment
      const response = await fetch('/api/v1/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              productId: actualProductId,
              quantity: 1,
            },
          ],
          customer: {
            email: prefill?.email || '',
            name: prefill?.name || '',
            locale: 'en', // Could be made dynamic
          },
          provider: { id: 'yoomoney' }, // Default provider, could be made configurable
          returnUrl: window.location.href, // Return to the same page after payment
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Payment initialization failed')
      }

      const data = await response.json()

      // Store the order ID for verification
      setOrderId(data.orderId)

      // Redirect to payment page
      window.location.href = data.paymentUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed')
    } finally {
      setIsLoading(false)
    }
  }

  // If payment is verified, show the Calendly booking widget
  if (step === 'booking' || paymentVerified) {
    return (
      <div className={className}>
        <Alert className="mb-4">
          <AlertDescription>{t('paymentComplete')}</AlertDescription>
        </Alert>
        <CalendlyBooking
          username={username}
          eventType={eventType}
          prefill={prefill}
          className={className}
        />
      </div>
    )
  }

  // Otherwise, show the payment step
  return (
    <div className={className}>
      <div className="p-6 border rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-2">{t('consultingTitle')}</h3>
        <p className="mb-4">{t('consultingDescription')}</p>

        <div className="flex justify-between items-center mb-6">
          <span className="font-medium">{t('price')}</span>
          <span className="text-xl font-bold">
            {price} {currency}
          </span>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleInitiatePayment} disabled={isLoading} className="w-full">
          {isLoading ? t('processing') : t('payNow')}
        </Button>
      </div>
    </div>
  )
}

export default ConsultingBookingFlow
