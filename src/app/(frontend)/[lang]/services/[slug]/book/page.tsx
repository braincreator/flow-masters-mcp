'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { GridContainer as Container } from '@/components/GridContainer'
import { useParams } from 'next/navigation'
import { ServiceBookingFlow } from '@/components/services/ServiceBookingFlow'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ServiceBookPage() {
  const params = useParams()
  const t = useTranslations('Services')

  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Получаем информацию об услуге
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/v1/services?slug=${params.slug}`)

        if (!response.ok) {
          throw new Error('Failed to fetch service')
        }

        const data = await response.json()

        if (!data.docs || data.docs.length === 0) {
          throw new Error('Service not found')
        }

        setService(data.docs[0])
      } catch (err) {
        console.error('Error fetching service:', err)
        setError(err instanceof Error ? err.message : 'Failed to load service')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchService()
    }
  }, [params.slug])

  // Получаем локализованные данные
  const locale = params.lang as string
  const title =
    service && typeof service.title === 'object'
      ? service.title[locale] || service.title.en
      : service?.title

  if (loading) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 rounded w-full max-w-md mx-auto"></div>
          </div>
        </div>
      </Container>
    )
  }

  if (error || !service) {
    return (
      <Container>
        <div className="py-12">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || t('serviceNotFound')}</AlertDescription>
          </Alert>

          <Button asChild>
            <Link href={`/${locale}/services`}>{t('backToServices')}</Link>
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{t('bookService')}</h1>
          <h2 className="text-xl mb-6">{title}</h2>

          <ServiceBookingFlow
            serviceId={service.id}
            price={service.price}
            currency="USD"
            requiresBooking={service.requiresBooking}
            bookingSettings={service.requiresBooking ? service.bookingSettings : undefined}
            className="mb-8"
            locale={locale}
          />

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href={`/${locale}/services/${params.slug}`}>{t('backToServiceDetails')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
