import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/utilities/auth/getServerSession'
import { Button } from '@/components/ui/button'
import ServiceBookingFlow from '@/components/services/ServiceBookingFlow'
import { Container } from '@/components/ui/container'
type Locale = 'en' | 'ru';

type ResumeBookingPageProps = {
  params: {
    lang: string
    orderId: string
  }
}

export async function generateMetadata({
  params: { lang },
}: ResumeBookingPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'ServiceBooking' })

  return {
    title: t('resumeBookingTitle'),
    description: t('resumeBookingDescription'),
  }
}

export default async function ResumeBookingPage({
  params: { lang, orderId },
}: ResumeBookingPageProps) {
  const t = await getTranslations({ locale: lang, namespace: 'ServiceBooking' })

  // Проверяем авторизацию пользователя
  const session = await getServerSession()

  if (!session?.user?.id) {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    return redirect(`/${lang}/login?returnUrl=/${lang}/services/booking/resume/${orderId}`)
  }

  try {
    const payload = await getPayloadClient()

    // Получаем информацию о заказе
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1,
    })

    // Проверяем, принадлежит ли заказ текущему пользователю
    if (typeof order.customer === 'object' && order.customer.id !== session.user.id) {
      return notFound()
    }

    // Проверяем, оплачен ли заказ
    if (order.status !== 'completed') {
      // Если заказ не оплачен, перенаправляем на страницу оплаты
      return redirect(`/${lang}/services/${order.serviceData?.serviceId}/book`)
    }

    // Получаем информацию об услуге
    if (!order.serviceData?.serviceId || typeof order.serviceData.serviceId !== 'string') {
      return notFound();
    }

    const service = await payload.findByID({
      collection: 'services',
      id: order.serviceData.serviceId,
    })

    if (!service) {
      return notFound()
    }

    // Получаем локализованные данные
    const title =
      typeof service.title === 'object' ? service.title[lang] || (service.title as any).en : service.title as string

    return (
      <Container>
        <div className="py-12 max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{t('resumeBookingTitle')}</h1>
            <p className="text-gray-600 mb-4">{t('resumeBookingDescription')}</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/${lang}/services/${service.slug}`}>{t('backToServiceDetails')}</Link>
            </Button>
          </div>

          <ServiceBookingFlow
            serviceId={service.id}
            price={service.price}
            requiresBooking={service.requiresBooking ?? undefined}
            bookingSettings={service.bookingSettings ? { ...service.bookingSettings, provider: (service.bookingSettings.provider ?? 'other'), calendlyUsername: service.bookingSettings.calendlyUsername ?? undefined, calendlyEventType: service.bookingSettings.calendlyEventType ?? undefined, hideEventTypeDetails: service.bookingSettings.hideEventTypeDetails ?? undefined, hideGdprBanner: service.bookingSettings.hideGdprBanner ?? undefined, enableAdditionalInfo: service.bookingSettings.enableAdditionalInfo ?? undefined, additionalInfoFields: service.bookingSettings.additionalInfoFields?.map(field => ({ ...field, required: field.required ?? false })) ?? undefined } as any : undefined}
            locale={lang as Locale}
            className="w-full"
            orderId={orderId}
            skipPayment={true}
          />
        </div>
      </Container>
    )
  } catch (error) {
    console.error('Error fetching order:', error)
    return notFound()
  }
}
