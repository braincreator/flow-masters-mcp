import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service.registry'
import { Container } from '@/components/Container'
import ServicesList from '@/components/services/ServicesList'

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'Services' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function ServicesPage({ params: { lang } }: { params: { lang: string } }) {
  const t = await getTranslations({ locale: lang, namespace: 'Services' })

  return (
    <Container>
      <div className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('description')}</p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{t('serviceTypes.consultation')}</h2>
          <ServicesList serviceType="consultation" limit={3} className="mb-8" />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{t('serviceTypes.development')}</h2>
          <ServicesList serviceType="development" limit={3} className="mb-8" />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{t('serviceTypes.integration')}</h2>
          <ServicesList serviceType="integration" limit={3} className="mb-8" />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{t('serviceTypes.audit')}</h2>
          <ServicesList serviceType="audit" limit={3} className="mb-8" />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{t('serviceTypes.content_creation')}</h2>
          <ServicesList serviceType="content_creation" limit={3} className="mb-8" />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{t('serviceTypes.automation')}</h2>
          <ServicesList serviceType="automation" limit={3} className="mb-8" />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{t('serviceTypes.support')}</h2>
          <ServicesList serviceType="support" limit={3} className="mb-8" />
        </div>
      </div>
    </Container>
  )
}
