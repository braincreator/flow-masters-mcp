'use client'

import React from 'react'
import { PaymentStatus } from '@/types/constants'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface PaymentStatusProps {
  status: PaymentStatus
  orderNumber: string
  amount: number
  currency: string
  className?: string
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  orderNumber,
  amount,
  currency,
  className,
}) => {
  const router = useRouter()

  const statusConfig = {
    pending: {
      icon: ClockIcon,
      title: 'Payment Pending',
      description: 'Your payment is being processed.',
      color: 'text-yellow-500',
    },
    processing: {
      icon: ClockIcon,
      title: 'Payment Processing',
      description: 'Your payment is being processed.',
      color: 'text-blue-500',
    },
    paid: {
      icon: CheckCircleIcon,
      title: 'Payment Successful',
      description: 'Thank you for your payment.',
      color: 'text-green-500',
    },
    failed: {
      icon: XCircleIcon,
      title: 'Payment Failed',
      description: 'There was an error processing your payment.',
      color: 'text-red-500',
    },
    refunded: {
      icon: CheckCircleIcon,
      title: 'Payment Refunded',
      description: 'Your payment has been refunded.',
      color: 'text-gray-500',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={className}>
      <div className="text-center">
        <Icon className={`h-12 w-12 ${config.color} mx-auto`} />
        <h2 className="mt-4 text-2xl font-bold">{config.title}</h2>
        <p className="mt-2 text-gray-600">{config.description}</p>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Order Number</div>
          <div className="font-medium">{orderNumber}</div>
          <div className="mt-2 text-sm text-gray-600">Amount</div>
          <div className="font-medium">
            {amount} {currency}
          </div>
        </div>

        <div className="mt-6 space-x-4">
          {status === 'failed' && (
            <Button
              onClick={() => router.push(`/orders/${orderNumber}`)}
              variant="primary"
            >
              Try Again
            </Button>
          )}
          <Button
            onClick={() => router.push('/orders')}
            variant="secondary"
          >
            View Orders
          </Button>
        </div>
      </div>
    </div>
  )
}