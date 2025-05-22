'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/utilities/formatPrice'
import { formatOrderNumberForDisplay } from '@/utilities/orderNumber'
import { CalendarClock, AlertCircle } from 'lucide-react'

type PendingBooking = {
  order: any
  service: any
  booking: any
}

type PendingBookingsProps = {
  locale?: string
  className?: string
}

export const PendingBookings: React.FC<PendingBookingsProps> = ({
  locale = 'ru',
  className = '',
}) => {
  const t = useTranslations('ServiceBooking')
  const router = useRouter()
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/v1/services/booking/pending')

        if (!response.ok) {
          throw new Error('Failed to fetch pending bookings')
        }

        const data = await response.json()
        setPendingBookings(data.pendingBookings || [])
      } catch (err) {
        console.error('Error fetching pending bookings:', err)
        setError(err instanceof Error ? err.message : 'Failed to load pending bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchPendingBookings()
  }, [])

  // Если загружаем данные, показываем скелетон
  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-1/3" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Если нет незавершенных бронирований, ничего не показываем
  if (pendingBookings.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <Alert variant="warning" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('pendingBookingsTitle')}</AlertTitle>
        <AlertDescription>
          {t('pendingBookingsDescription')}
        </AlertDescription>
      </Alert>

      {pendingBookings.map((item) => {
        const serviceTitle = typeof item.service?.title === 'object'
          ? item.service?.title[locale] || item.service?.title.en
          : item.service?.title || t('unknownService')

        return (
          <Card key={item.order.id} className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarClock className="h-5 w-5 mr-2 text-amber-500" />
                {t('pendingBookingFor')} {serviceTitle}
              </CardTitle>
              <CardDescription>
                {t('orderNumber')}: {formatOrderNumberForDisplay(item.order.orderNumber)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{t('price')}:</span>
                <span className="font-medium">
                  {formatPrice(item.order.total?.en?.amount || 0, item.order.total?.en?.currency || 'USD', locale)}
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">{t('status')}:</span>
                <span className="font-medium text-green-600">{t('paid')}</span>
              </div>
              <p className="text-amber-600">
                {t('bookingNotCompleted')}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push(`/${locale}/services/booking/resume/${item.order.id}`)}
                className="w-full"
              >
                {t('resumeBooking')}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export default PendingBookings
