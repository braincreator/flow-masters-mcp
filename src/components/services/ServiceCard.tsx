import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/utilities/formatPrice'
import { Button } from '@/components/ui/button'
import { Service } from '@/types/service'

type ServiceCardProps = {
  service: Service
  locale?: string
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, locale = 'ru' }) => {
  const t = useTranslations('Services')

  // Получаем локализованные данные
  const title =
    typeof service.title === 'object' ? service.title[locale] || service.title.en : service.title
  const shortDescription =
    typeof service.shortDescription === 'object'
      ? service.shortDescription[locale] || service.shortDescription.en
      : service.shortDescription

  // Формируем URL услуги
  const serviceUrl = `/${locale}/services/${service.slug}`

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {service.thumbnail && (
        <div className="relative h-48 w-full">
          <Image
            src={service.thumbnail.url}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{shortDescription}</p>

        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">{formatPrice(service.price, 'USD', locale)}</span>
          <span className="text-sm text-gray-500">
            {service.duration ? `${service.duration} ${t('minutes')}` : t('flexible')}
          </span>
        </div>

        <div className="flex space-x-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={serviceUrl}>{t('details')}</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`${serviceUrl}/book`}>
              {service.requiresBooking ? t('book') : t('order')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
