import React from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/ui/container'
import { getPayloadClient } from '@/utilities/payload/index'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Service } from '@/types/service'

// Define the PageParams type for this page
type PageParams = {
  lang: string
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.lang, namespace: 'Services' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function ServicesPage({ params }: { params: PageParams }) {
  setRequestLocale(params.lang)

  const t = await getTranslations({ locale: params.lang, namespace: 'Services' })

  try {
    const payload = await getPayloadClient()

    // Получаем все опубликованные услуги
    const services = await payload.find({
      collection: 'services',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-createdAt',
      depth: 1,
    })

    if (!services || services.docs.length === 0) {
      return (
        <Container>
          <div className="py-12">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <p>{t('noServices')}</p>
          </div>
        </Container>
      )
    }

    // Адаптируем услуги из Payload к нашему типу Service
    const adaptedServices = services.docs.map((payloadService) => {
      // Создаем объект, соответствующий типу Service из @/types/service
      return {
        id: payloadService.id,
        title: payloadService.title,
        slug: payloadService.slug || '',
        serviceType: (payloadService.serviceType || 'other') as Service['serviceType'],
        description: payloadService.description,
        shortDescription: payloadService.shortDescription || '',
        price: payloadService.price || 0,
        duration: payloadService.duration,
        thumbnail: payloadService.thumbnail,
        features: payloadService.features,
        requiresBooking: payloadService.requiresBooking || false,
        bookingSettings: payloadService.bookingSettings,
        requiresPayment: payloadService.requiresPayment || false,
        paymentSettings: payloadService.paymentSettings,
        status: (payloadService.status || 'draft') as Service['status'],
        publishedAt: payloadService.publishedAt,
        createdAt: payloadService.createdAt,
        updatedAt: payloadService.updatedAt,
      } as Service
    })

    // Группируем услуги по типу
    const servicesByType: Record<string, Service[]> = {}

    adaptedServices.forEach((service) => {
      const type = service.serviceType || 'other'

      if (!servicesByType[type]) {
        servicesByType[type] = []
      }

      servicesByType[type].push(service)
    })

    return (
      <Container>
        <div className="py-12">
          <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
          <p className="text-lg mb-8">{t('description')}</p>

          {Object.entries(servicesByType).map(([type, services]) => (
            <div key={type} className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">{t(`serviceTypes.${type}`)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} locale={params.lang} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    )
  } catch (error) {
    console.error('Error fetching services:', error)
    notFound()
  }
}
