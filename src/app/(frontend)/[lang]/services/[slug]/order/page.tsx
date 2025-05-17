import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/utilities/getPayloadClient'
import ServiceOrderForm from '@/components/ServiceOrder/ServiceOrderForm'
import { PageHeading } from '@/components/PageHeading'

export async function generateMetadata({
  params: { lang, slug },
}: {
  params: { lang: string; slug: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'ServiceOrder' })

  const payload = await getPayloadClient()

  const { docs: services } = await payload.find({
    collection: 'services',
    where: {
      slug: {
        equals: slug,
      },
    },
    locale: lang as "en" | "ru", // Assert that lang is a valid locale after the check in the function body
  })

  if (!services.length) return notFound()

  const service = services[0]
  // Ensure service is defined after notFound check
  if (!service) return notFound()

  return {
    title: `${t('orderTitle')} - ${service.title}`,
    description: service.shortDescription,
  }
}

export default async function ServiceOrderPage({
  params: { lang, slug },
}: {
  params: { lang: string; slug: string }
}) {
  // Validate locale
  const supportedLocales = ['en', 'ru']; // Get this from src/i18n/routing.ts
  if (!supportedLocales.includes(lang)) {
    notFound();
  }

  // Assert that lang is a valid locale after the check
  const validLocale = lang as "en" | "ru";

  const t = await getTranslations({ locale: validLocale, namespace: 'ServiceOrder' })

  const payload = await getPayloadClient()

  const { docs: services } = await payload.find({
    collection: 'services',
    where: {
      slug: {
        equals: slug,
      },
    },
    locale: validLocale,
  })

  if (!services.length) return notFound()

  const service = services[0]
  // Ensure service is defined after notFound check
  if (!service) return notFound()

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <PageHeading title={t('orderHeading', { serviceName: service.title })} />
      <div className="my-10">
        <ServiceOrderForm lang={lang} service={service} />
      </div>
    </div>
  )
}
