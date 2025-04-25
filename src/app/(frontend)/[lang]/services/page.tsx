import React from 'react'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/Container'
import { getPayloadClient } from '@/utilities/payload'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PageParams } from '@/types/page'
import { ServiceCard } from '@/components/services/ServiceCard'

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.lang, namespace: 'Services' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function ServicesPage({ params }: { params: PageParams }) {
  unstable_setRequestLocale(params.lang)
  
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
    
    // Группируем услуги по типу
    const servicesByType: Record<string, any[]> = {}
    
    services.docs.forEach((service) => {
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
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    locale={params.lang}
                  />
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
