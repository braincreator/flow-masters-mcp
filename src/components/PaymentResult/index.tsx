'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PaymentResult as PaymentResultType } from '@/types/payment'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useToast } from '@/hooks/useToast'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './PaymentResult.module.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

interface PaymentResultProps {
  lang?: string
  successText?: string
  errorText?: string
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

export default function PaymentResult({
  lang = 'en',
  successText = 'Payment successful!',
  errorText = 'Payment failed',
}: PaymentResultProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'success' | 'error' | 'processing'>('processing')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState<number | null>(null)

  useEffect(() => {
    async function checkPaymentStatus() {
      try {
        // Extract payment information from URL parameters
        const orderId = searchParams.get('orderId')
        const paymentId = searchParams.get('paymentId')
        const resultStatus = searchParams.get('status')

        if (!orderId) {
          setStatus('error')
          setErrorMessage('Missing order information')
          setLoading(false)
          return
        }

        // If status is directly specified in URL
        if (resultStatus === 'success' || resultStatus === 'paid') {
          setStatus('success')
          await fetchOrderDetails(orderId)
          setLoading(false)
          return
        }

        if (resultStatus === 'fail' || resultStatus === 'error' || resultStatus === 'cancelled') {
          setStatus('error')
          setErrorMessage('Payment was cancelled or failed')
          await fetchOrderDetails(orderId)
          setLoading(false)
          return
        }

        // Otherwise check with API
        await verifyPayment(orderId, paymentId)
      } catch (error) {
        console.error('Error checking payment status:', error)
        setStatus('error')
        setErrorMessage('An error occurred while checking payment status')
        setLoading(false)
      }
    }

    checkPaymentStatus()
  }, [searchParams])

  async function fetchOrderDetails(orderId: string) {
    try {
      const res = await fetch(`/api/v1/order/${orderId}`)
      if (!res.ok) {
        console.error('Failed to fetch order details:', res.statusText)
        return
      }

      const data = await res.json()
      if (data.order?.orderNumber) {
        setOrderNumber(data.order.orderNumber)
      }
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }
      if (data.totalAmount) {
        setTotalAmount(data.totalAmount)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  async function verifyPayment(orderId: string, paymentId: string | null) {
    try {
      const res = await fetch(
        `/api/v1/payment/verify?orderId=${orderId}${paymentId ? `&paymentId=${paymentId}` : ''}`,
      )

      if (!res.ok) {
        setStatus('error')
        setErrorMessage('Payment verification failed')
        await fetchOrderDetails(orderId)
        setLoading(false)
        return
      }

      const data = await res.json()

      if (data.status === 'paid' || data.status === 'success') {
        setStatus('success')
      } else if (data.status === 'processing' || data.status === 'pending') {
        setStatus('processing')
        setErrorMessage('Payment is still processing, please wait')
      } else {
        setStatus('error')
        setErrorMessage(data.message || 'Payment was not successful')
      }

      if (data.orderNumber) {
        setOrderNumber(data.orderNumber)
      } else {
        await fetchOrderDetails(orderId)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setStatus('error')
      setErrorMessage('Could not verify payment status')
    } finally {
      setLoading(false)
    }
  }

  // Redirect to home after successful payment after delay
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout
    if (status === 'success') {
      redirectTimer = setTimeout(() => {
        router.push(`/${lang}`)
      }, 5000)
    }
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [status, router, lang])

  useEffect(() => {
    if (status === 'success' && sessionId) {
      console.log('Payment successful for session:', sessionId)
    } else if (status === 'error' && sessionId) {
      console.log('Payment error for session:', sessionId)
    }
  }, [status, sessionId])

  if (loading) {
    return (
      <div className={`${styles.paymentResult} ${styles.paymentProcessing}`}>
        <div className={styles.spinner}></div>
        <h2>Processing payment...</h2>
        <p>Please wait while we verify your payment</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className={`${styles.paymentResult} ${styles.paymentSuccess}`}>
        <div className={styles.successIcon}>✓</div>
        <h2>{successText}</h2>
        {orderNumber && <p>Order: #{orderNumber}</p>}
        <p>Thank you for your purchase!</p>
        <p>You will be redirected to the home page in 5 seconds...</p>
        <Link href={`/${lang}`} className={styles.button}>
          Return to Home Page
        </Link>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={`${styles.paymentResult} ${styles.paymentError}`}>
        <div className={styles.errorIcon}>✗</div>
        <h2>{errorText}</h2>
        {errorMessage && <p>{errorMessage}</p>}
        {orderNumber && <p>Order: #{orderNumber}</p>}
        <Link href={`/${lang}/checkout`} className={styles.button}>
          Try Again
        </Link>
        <Link href={`/${lang}`} className={`${styles.button} ${styles.buttonSecondary}`}>
          Return to Home Page
        </Link>
      </div>
    )
  }

  // Processing state (fallback if status is still processing)
  return (
    <div className={`${styles.paymentResult} ${styles.paymentProcessing}`}>
      <div className={styles.spinner}></div>
      <h2>Processing payment...</h2>
      <p>Your payment is being processed. This may take a moment.</p>
      <p>Please do not close this page.</p>
    </div>
  )
}
