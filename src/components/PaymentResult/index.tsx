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
import { useTranslations } from 'next-intl'
import { Locale } from '@/constants'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface PaymentResultProps {
  locale: Locale
}

export default function PaymentResult({ locale }: PaymentResultProps) {
  const t = useTranslations('PaymentResult')
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
          setErrorMessage(t('errorMissingOrderInfo'))
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
          setErrorMessage(t('errorCancelledOrFailed'))
          await fetchOrderDetails(orderId)
          setLoading(false)
          return
        }

        // Otherwise check with API
        await verifyPayment(orderId, paymentId)
      } catch (error) {
        logError('Error checking payment status:', error)
        setStatus('error')
        setErrorMessage(t('errorStatusCheck'))
        setLoading(false)
      }
    }

    checkPaymentStatus()
  }, [searchParams])

  async function fetchOrderDetails(orderId: string) {
    try {
      const res = await fetch(`/api/order/${orderId}`)
      if (!res.ok) {
        logError('Failed to fetch order details:', res.statusText)
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
      logError('Error fetching order details:', error)
    }
  }

  async function verifyPayment(orderId: string, paymentId: string | null) {
    try {
      const res = await fetch(
        `/api/payment/verify?orderId=${orderId}${paymentId ? `&paymentId=${paymentId}` : ''}`,
      )

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(t('errorVerificationFailed'))
        await fetchOrderDetails(orderId)
        setLoading(false)
        return
      }

      const data = await res.json()

      if (data.status === 'paid' || data.status === 'success') {
        setStatus('success')
      } else if (data.status === 'processing' || data.status === 'pending') {
        setStatus('processing')
        setErrorMessage(t('errorProcessingWait'))
      } else {
        setStatus('error')
        setErrorMessage(data.message || t('errorNotSuccessful'))
      }

      if (data.orderNumber) {
        setOrderNumber(data.orderNumber)
      } else {
        await fetchOrderDetails(orderId)
      }
    } catch (error) {
      logError('Error verifying payment:', error)
      setStatus('error')
      setErrorMessage(t('errorVerifyStatus'))
    } finally {
      setLoading(false)
    }
  }

  // Redirect to home after successful payment after delay
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout
    if (status === 'success') {
      redirectTimer = setTimeout(() => {
        router.push(`/${locale}`)
      }, 5000)
    }
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [status, router, locale])

  useEffect(() => {
    if (status === 'success' && sessionId) {
      logDebug('Payment successful for session:', sessionId)
    } else if (status === 'error' && sessionId) {
      logDebug('Payment error for session:', sessionId)
    }
  }, [status, sessionId])

  if (loading) {
    return (
      <div className={`${styles.paymentResult} ${styles.paymentProcessing}`}>
        <div className={styles.spinner}></div>
        <h2>{t('processingTitle')}</h2>
        <p>{t('processingDescription')}</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className={`${styles.paymentResult} ${styles.paymentSuccess} text-center flex flex-col items-center`}>
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">{t('successTitle')}</h2>
        {orderNumber && <p className="mb-1">{t('successOrderLabel', { orderNumber })}</p>}
        <p className="text-muted-foreground mb-1">{t('successThankYou')}</p>
        <p className="text-muted-foreground mb-4 text-sm">{t('successRedirect')}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${locale}`}>{t('successHomeButton')}</Link>
        </Button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={`${styles.paymentResult} ${styles.paymentError} text-center flex flex-col items-center`}>
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-red-600">{t('errorTitle')}</h2>
        {errorMessage && <p className="mb-1 text-red-700">{errorMessage}</p>}
        {orderNumber && <p className="mb-4">{t('errorOrderLabel', { orderNumber })}</p>}
        <div className="flex gap-3 mt-4">
          <Button asChild variant="default" size="sm">
            <Link href={`/${locale}/checkout`}>{t('errorTryAgainButton')}</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}`}>{t('errorHomeButton')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Processing state (fallback if status is still processing)
  return (
    <div className={`${styles.paymentResult} ${styles.paymentProcessing}`}>
      <div className={styles.spinner}></div>
      <h2>{t('processingTitle')}</h2>
      <p>{t('processingWaitMessage')}</p>
      <p>{t('processingDoNotClose')}</p>
    </div>
  )
}
