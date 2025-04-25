import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service.registry'
import { Container } from '@/components/Container'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/utilities/formatPrice'
import { RichText } from '@/components/RichText'
import { CheckCircle, XCircle } from 'lucide-react'

type ServicePageProps = {
  params: {
    lang: string
    slug: string
  }
}

export async function generateMetadata({
  params: { lang, slug },
}: ServicePageProps): Promise<Metadata> {
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
      title: service.meta?.title || title,
      description: service.meta?.description || service.shortDescription,
      openGraph: service.meta?.image
        ? {
            images: [{ url: service.meta.image.url }],
          }
        : undefined,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Service',
    }
  }
}

export default async function ServicePage({ params: { lang, slug } }: ServicePageProps) {
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
    const description = typeof service.description === 'object' ? service.description[lang] || service.description.en : service.description
    
    return (
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Основная информация */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              
              {service.thumbnail && (
                <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={service.thumbnail.url}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="prose max-w-none mb-8">
                <RichText content={description} />
              </div>
              
              {/* Галерея изображений */}
              {service.gallery && service.gallery.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Галерея</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {service.gallery.map((item, index) => (
                      <div key={index} className="relative h-40 rounded-lg overflow-hidden">
                        <Image
                          src={item.image.url}
                          alt={item.caption || `Image ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Связанные услуги */}
              {service.relatedServices && service.relatedServices.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-semibold mb-4">Похожие услуги</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.relatedServices.map((relatedService) => (
                      <div key={relatedService.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{relatedService.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{relatedService.shortDescription}</p>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/${lang}/services/${relatedService.slug}`}>
                            {t('details')}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Боковая панель */}
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 shadow-sm sticky top-24">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">{t('serviceDetails')}</h2>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('price')}</span>
                    <span className="font-medium">{formatPrice(service.price, 'USD', lang)}</span>
                  </div>
                  
                  {service.duration && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{t('duration')}</span>
                      <span className="font-medium">{service.duration} {t('minutes')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('type')}</span>
                    <span className="font-medium">{t(`serviceTypes.${service.serviceType}`)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('paymentRequired')}</span>
                    <span className="font-medium">{service.requiresPayment ? '✓' : '✗'}</span>
                  </div>
                </div>
                
                {/* Особенности услуги */}
                {service.features && service.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">{t('features')}</h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          {feature.included ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button asChild className="w-full mb-2">
                  <Link href={`/${lang}/services/${slug}/book`}>
                    {service.requiresBooking ? t('book') : t('order')}
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${lang}/services`}>
                    {t('backToServices')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    )
  } catch (error) {
    console.error('Error fetching service:', error)
    notFound()
  }
}
