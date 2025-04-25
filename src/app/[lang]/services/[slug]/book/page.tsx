import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service.registry'
import { Container } from '@/components/Container'
import { Button } from '@/components/ui/button'
import ServiceBookingFlow from '@/components/services/ServiceBookingFlow'

type ServiceBookingPageProps = {
  params: {
    lang: string
    slug: string
  }
}

export async function generateMetadata({
  params: { lang, slug },
}: ServiceBookingPageProps): Promise<Metadata> {
  try {
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const serviceService = serviceRegistry.getServiceService()
    
    const service = await serviceService.getServiceBySlug(slug, lang)
    
    if (!service) {
      return {
        title: 'Service Not Found',
      }
    }
    
    const title = typeof service.title === 'object' ? service.title[lang] || service.title.en : service.title
    
    return {
      title: `${service.requiresBooking ? 'Book' : 'Order'} ${title}`,
      description: service.shortDescription,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Service Booking',
    }
  }
}

export default async function ServiceBookingPage({ params: { lang, slug } }: ServiceBookingPageProps) {
  const t = await getTranslations({ locale: lang, namespace: 'Services' })
  
  try {
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const serviceService = serviceRegistry.getServiceService()
    
    const service = await serviceService.getServiceBySlug(slug, lang)
    
    if (!service) {
      notFound()
    }
    
    // Получаем локализованные данные
    const title = typeof service.title === 'object' ? service.title[lang] || service.title.en : service.title
    
    return (
      <Container>
        <div className="py-12 max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {service.requiresBooking ? t('bookService') : t('order')} {title}
            </h1>
            <Button asChild variant="outline" size="sm">
              <Link href={`/${lang}/services/${slug}`}>
                {t('backToServiceDetails')}
              </Link>
            </Button>
          </div>
          
          <ServiceBookingFlow
            serviceId={service.id}
            price={service.price}
            requiresBooking={service.requiresBooking}
            bookingSettings={service.bookingSettings}
            className="w-full"
          />
        </div>
      </Container>
    )
  } catch (error) {
    console.error('Error fetching service:', error)
    notFound()
  }
}
