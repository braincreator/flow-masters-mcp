'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PaymentResult as PaymentResultType } from '@/types/payment'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useToast } from '@/hooks/useToast'

interface PaymentResultProps {
  result: PaymentResultType
  onRetry?: () => void
}

const ResultIcon = ({ success }: { success: boolean }) => (
  <div
    role="img"
    aria-label={success ? 'Success' : 'Error'}
    className={`text-4xl ${success ? 'text-green-500' : 'text-red-500'}`}
  >
    {success ? '✓' : '×'}
  </div>
)

const ActionButton = ({
  href,
  variant = 'primary',
  children,
}: {
  href: string
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}) => (
  <Link
    href={href}
    className={`
      inline-block px-6 py-2 rounded-md
      ${
        variant === 'primary'
          ? 'bg-purple-600 text-white hover:bg-purple-700'
          : 'border border-gray-300 hover:bg-gray-50'
      }
    `}
  >
    {children}
  </Link>
)

export const PaymentResult = ({ result, onRetry }: PaymentResultProps) => {
  const { trackEvent } = useAnalytics()
  const { showToast } = useToast()
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    trackEvent(result.success ? 'payment_success' : 'payment_failure', {
      orderId: result.orderId,
      transactionId: result.transactionId,
    })
  }, [result, trackEvent])

  const handleRetry = async () => {
    if (retryCount >= 3) {
      showToast('Too many retry attempts. Please contact support.', 'error')
      return
    }
    setRetryCount((prev) => prev + 1)
    onRetry?.()
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
      <div className="max-w-lg mx-auto p-6" role="alert" aria-live="polite">
        {result.success ? (
          <div className="text-center space-y-4">
            <ResultIcon success={true} />
            <h1 className="text-2xl font-bold">Payment Successful</h1>
            <p className="text-gray-600">
              Thank you for your payment. Your order #{result.orderId} has been confirmed.
            </p>
            {result.transactionId && (
              <p className="text-sm text-gray-500">Transaction ID: {result.transactionId}</p>
            )}
            <div className="pt-6">
              <ActionButton href="/orders">View Orders</ActionButton>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <ResultIcon success={false} />
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p className="text-gray-600">
              {result.error || 'There was an error processing your payment.'}
            </p>
            <div className="pt-6 space-x-4">
              <button
                onClick={handleRetry}
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={retryCount >= 3}
              >
                Try Again ({3 - retryCount} attempts remaining)
              </button>
              <ActionButton href="/contact" variant="secondary">
                Contact Support
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
