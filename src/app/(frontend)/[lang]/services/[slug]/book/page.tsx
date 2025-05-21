'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { GridContainer as Container } from '@/components/GridContainer'
import { useParams } from 'next/navigation'
import { ServiceBookingFlow, type Locale as ServiceBookingLocale } from '@/components/services/ServiceBookingFlow'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Breadcrumbs from '@/components/Breadcrumbs'
import AnimateInView from '@/components/AnimateInView'
import ServicePrice from '@/components/services/ServicePrice'

export default function ServiceBookPage() {
  const params = useParams()
  const t = useTranslations('Services')
  const commonT = useTranslations('common')

  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Получаем информацию об услуге
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/v1/services?slug=${params.slug}&locale=${params.lang}`)

        if (!response.ok) {
          throw new Error(t('errorFetchingService', { defaultValue: 'Failed to fetch service' }))
        }

        const data = await response.json()

        if (!data.docs || data.docs.length === 0) {
          throw new Error(t('serviceNotFound', { defaultValue: 'Service not found' }))
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
  const locale = params.lang as ServiceBookingLocale
  const title =
    service && typeof service.title === 'object'
      ? service.title[locale] || service.title.en
      : service?.title

  if (loading) {
    return (
      <Container>
        <div className="py-3 md:py-4 lg:py-5">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded-md w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-card rounded-md w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-card rounded-md w-1/4 mx-auto mb-8"></div>
            <div className="h-96 bg-card rounded-xl w-full max-w-2xl mx-auto shadow-md"></div>
          </div>
        </div>
      </Container>
    )
  }

  if (error || !service) {
    return (
      <Container>
        <div className="py-3 md:py-4 lg:py-5">
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertDescription>{error || t('serviceNotFound')}</AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button asChild variant="default">
              <Link href={`/${locale}/services`} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToServices')}
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  // Определяем тип услуги для отображения
  const serviceTypeLabel = t(`serviceTypes.${service.serviceType}`) || service.serviceType

  // Логирование для отладки
  console.log('Full service data on book page:', JSON.stringify(service, null, 2))

  if (!service.id) {
    return (
      <Container>
        <div className="py-3 md:py-4 lg:py-5">
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertDescription>{t('errorServiceIdNotFound', { defaultValue: 'Error: Service ID not found' })}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button asChild variant="default">
              <Link href={`/${locale}/services`} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToServices')}
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-3 md:py-4 lg:py-5">
        {/* Хлебные крошки */}
        <Breadcrumbs
          items={[
            { label: commonT('services'), url: `/${locale}/services` },
            { label: title, url: `/${locale}/services/${params.slug}` },
            { label: t('bookService'), active: true },
          ]}
          homeLabel={commonT('home')}
          variant="cards"
          className="mb-8"
        />

        {/* Декоративные элементы для фона */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto">
          <AnimateInView direction="right" className="mb-6">
            <Button
              variant="outline"
              className="flex items-center border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary"
              asChild
            >
              <Link href={`/${locale}/services/${params.slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToServiceDetails')}
              </Link>
            </Button>
          </AnimateInView>

          <AnimateInView direction="up" className="mb-10">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('bookService')}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {serviceTypeLabel}
                  </Badge>
                  {service.price !== undefined && (
                    <div className="flex items-center text-sm">
                      <Tag className="h-3.5 w-3.5 mr-1" />
                      <ServicePrice price={service.price} locale={locale} />
                    </div>
                  )}
                  {service.duration && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {service.duration} {t('minutes')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              {service.shortDescription && (
                <p className="text-muted-foreground mt-2">{service.shortDescription}</p>
              )}
            </div>
          </AnimateInView>

          <AnimateInView
            direction="up"
            className="bg-card rounded-xl border border-border/10 shadow-md p-6 mb-8"
          >
            <ServiceBookingFlow
              serviceId={service.id}
              price={service.price}
              requiresBooking={service.requiresBooking}
              bookingSettings={service.bookingSettings} // Always pass bookingSettings
              className="mb-0"
              locale={locale}
              skipPayment={service.requiresPayment === false} // Pass skipPayment based on service data
            />
          </AnimateInView>
        </div>
      </div>
    </Container>
  )
}
