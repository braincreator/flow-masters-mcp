import React from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { GridContainer as Container } from '@/components/GridContainer'
import { getPayloadClient } from '@/utilities/payload/index'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Service } from '@/types/service'
import AnimateInView from '@/components/AnimateInView'
import ServiceList from '@/components/services/ServiceList'
import Breadcrumbs from '@/components/Breadcrumbs'

// Define the PageParams type for this page
type PageParams = {
  lang: string
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { lang } = await params
  const t = await getTranslations({ locale: lang, namespace: 'Services' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function ServicesPage({ params }: { params: PageParams }) {
  const { lang } = await params
  setRequestLocale(lang)

  const t = await getTranslations({ locale: lang, namespace: 'Services' })
  const commonT = await getTranslations({ locale: lang, namespace: 'common' })

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
      locale: lang as 'en' | 'ru',
      sort: '-createdAt',
      depth: 1,
    })

    if (!services || services.docs.length === 0) {
      return (
        <Container>
          <div className="py-3 md:py-4 lg:py-5">
            {/* Хлебные крошки */}
            <Breadcrumbs
              items={[{ label: commonT('services'), active: true }]}
              homeLabel={commonT('home')}
              variant="cards"
            />

            <AnimateInView direction="up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-xl text-muted-foreground">{t('noServices')}</p>
            </AnimateInView>
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
        // Добавляем поддержку isPriceStartingFrom, включаем его по умолчанию
        // для демонстрационных целей, если в данных Payload это поле не задано
        isPriceStartingFrom:
          typeof payloadService.isPriceStartingFrom !== 'undefined'
            ? payloadService.isPriceStartingFrom
            : true, // По умолчанию показываем "от" для всех услуг
      } as Service
    })

    // Получаем все уникальные типы услуг
    const serviceTypes = Array.from(
      new Set(adaptedServices.map((service) => service.serviceType || 'other')),
    )

    // Преобразуем переводы в объект для передачи клиентскому компоненту
    const servicesTranslations: Record<string, string> = {
      // Базовые переводы
      title: t('title'),
      description: t('description'),
      heroTitle: t('heroTitle'),
      heroSubtitle: t('heroSubtitle'),
      searchServices: t('searchServices'),
      filterServices: t('filterServices'),
      resetFilters: t('resetFilters'),
      servicesNotFound: t('servicesNotFound'),
      tryAnotherSearch: t('tryAnotherSearch'),
      showAllServices: t('showAllServices'),
      // Типы услуг
      'serviceTypes.consulting': t('serviceTypes.consulting'),
      'serviceTypes.consultation': t('serviceTypes.consultation'),
      'serviceTypes.development': t('serviceTypes.development'),
      'serviceTypes.support': t('serviceTypes.support'),
      'serviceTypes.other': t('serviceTypes.other'),
      // Дополнительные переводы для карточек услуг
      book: t('book'),
      order: t('order'),
      details: t('details'),
      startingFrom: t('startingFrom', { fallback: 'от' }),
      featured: t('featured', { fallback: 'Рекомендуем' }),
      newService: t('newService', { fallback: 'Новинка' }),
      popular: t('popular', { fallback: 'Популярно' }),
      flexible: t('flexible', { fallback: 'Гибкий график' }),
      paymentRequired: t('paymentRequired', { fallback: 'Требуется оплата' }),
      noPaymentRequired: t('noPaymentRequired', { fallback: 'Без предоплаты' }),
    }

    const commonTranslations: Record<string, string> = {
      home: commonT('home'),
      services: commonT('services'),
      back: commonT('back'),
      search: commonT('search'),
    }

    return (
      <>
        {/* Улучшенная героическая секция */}
        <div className="relative py-5 md:py-7 lg:py-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-0"></div>

          {/* Декоративные элементы */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full"></div>

          {/* Паттерн на фоне */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          ></div>

          <Container className="relative z-10">
            {/* Хлебные крошки */}
            <Breadcrumbs
              items={[{ label: commonT('services'), active: true }]}
              homeLabel={commonT('home')}
              variant="cards"
            />

            <div className="text-center max-w-3xl mx-auto">
              <AnimateInView direction="up">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t('heroTitle')}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
                  {t('heroSubtitle')}
                </p>
              </AnimateInView>
            </div>

            {/* Клиентский компонент для фильтрации и отображения услуг */}
            <ServiceList
              services={adaptedServices}
              serviceTypes={serviceTypes}
              translations={servicesTranslations}
              commonTranslations={commonTranslations}
              locale={lang}
            />
          </Container>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error fetching services:', error)
    notFound()
  }
}
