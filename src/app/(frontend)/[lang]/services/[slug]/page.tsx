import React from 'react'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/Container'
import { getPayloadClient } from '@/utilities/payload/index'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@/components/RichText'
import { formatPrice } from '@/utilities/formatPrice'
import { Button } from '@/components/ui/button'

type ServicePageParams = {
  lang: string
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: ServicePageParams
}): Promise<Metadata> {
  try {
    const payload = await getPayloadClient()

    const service = await payload.find({
      collection: 'services',
      where: {
        slug: {
          equals: params.slug,
        },
      },
    })

    if (!service || service.docs.length === 0) {
      return {}
    }

    const serviceData = service.docs[0]
    const title =
      typeof serviceData.title === 'object'
        ? serviceData.title[params.lang] || serviceData.title.en
        : serviceData.title

    const metaTitle = serviceData.meta?.title || title
    const metaDescription = serviceData.meta?.description || serviceData.shortDescription
    const metaImage = serviceData.meta?.image?.url || serviceData.thumbnail?.url

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: metaImage
        ? {
            images: [metaImage],
          }
        : undefined,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {}
  }
}

export default async function ServicePage({ params }: { params: ServicePageParams }) {
  unstable_setRequestLocale(params.lang)

  const t = await getTranslations({ locale: params.lang, namespace: 'Services' })

  try {
    const payload = await getPayloadClient()

    // Получаем услугу по slug
    const service = await payload.find({
      collection: 'services',
      where: {
        slug: {
          equals: params.slug,
        },
        status: {
          equals: 'published',
        },
      },
      depth: 2,
    })

    if (!service || service.docs.length === 0) {
      notFound()
    }

    const serviceData = service.docs[0]

    // Получаем локализованные данные
    const title =
      typeof serviceData.title === 'object'
        ? serviceData.title[params.lang] || serviceData.title.en
        : serviceData.title

    const description = serviceData.description

    return (
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>

              {serviceData.thumbnail && (
                <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={serviceData.thumbnail.url}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="prose max-w-none">
                <RichText content={description} />
              </div>

              {serviceData.features && serviceData.features.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">{t('features')}</h2>
                  <ul className="space-y-2">
                    {serviceData.features.map((feature: any, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-green-500">✓</span>
                        <div>
                          <span className="font-medium">{feature.name}</span>
                          {feature.description && (
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-semibold mb-4">{t('serviceDetails')}</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('price')}</span>
                    <span className="font-bold">
                      {formatPrice(serviceData.price, 'USD', params.lang)}
                    </span>
                  </div>

                  {serviceData.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('duration')}</span>
                      <span>
                        {serviceData.duration} {t('minutes')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('type')}</span>
                    <span>{t(`serviceTypes.${serviceData.serviceType}`)}</span>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full mb-3">
                  <Link href={`/${params.lang}/services/${params.slug}/book`}>
                    {serviceData.requiresBooking ? t('book') : t('order')}
                  </Link>
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  {serviceData.requiresPayment ? t('paymentRequired') : t('noPaymentRequired')}
                </p>
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
