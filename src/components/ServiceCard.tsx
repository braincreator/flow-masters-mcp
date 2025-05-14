'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatItemPrice, getLocalePrice } from '@/utilities/formatPrice'
import { Button } from '@/components/ui/button'
import { Service, Media } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { Image } from '@/components/Image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

type ServiceCardProps = {
  service: Service
  locale: string
  fullWidth?: boolean
  hidePrice?: boolean
  hideDescription?: boolean
  imageSize?: 'small' | 'medium' | 'large'
}

export default function ServiceCard({
  service,
  locale,
  fullWidth = false,
  hidePrice = false,
  hideDescription = false,
  imageSize = 'medium',
}: ServiceCardProps) {
  const [localizedPrice, setLocalizedPrice] = useState<string>('')
  const translations = useTranslations('services')

  useEffect(() => {
    // Используем новую функцию форматирования цены
    setLocalizedPrice(formatItemPrice(service, locale))
  }, [service, locale])

  // Получаем информацию о картинке услуги
  const thumbnailUrl = service.thumbnail
    ? typeof service.thumbnail === 'string'
      ? service.thumbnail
      : (service.thumbnail as Media)?.url || ''
    : ''

  // Получаем локализованное название и описание
  const title =
    typeof service.title === 'object' && service.title !== null
      ? (service.title as any)[locale] || (service.title as any).en || 'Service'
      : service.title || 'Service'

  const shortDescription =
    typeof service.shortDescription === 'object' && service.shortDescription !== null
      ? (service.shortDescription as any)[locale] || (service.shortDescription as any).en || ''
      : service.shortDescription || ''

  // Определяем и переводим тип услуги
  const serviceTypeMap: { [key: string]: string } = {
    consultation: translations('types.consultation'),
    development: translations('types.development'),
    support: translations('types.support'),
    audit: translations('types.audit'),
    integration: translations('types.integration'),
    content_creation: translations('types.content_creation'),
    automation: translations('types.automation'),
    other: translations('types.other'),
  }

  const serviceType = service.serviceType
    ? serviceTypeMap[service.serviceType] || serviceTypeMap.other
    : serviceTypeMap.other

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
      className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${
        fullWidth ? 'w-full' : 'h-full'
      }`}
    >
      {thumbnailUrl && (
        <div
          className={`relative w-full ${
            imageSize === 'small' ? 'h-40' : imageSize === 'medium' ? 'h-52' : 'h-64'
          } overflow-hidden`}
        >
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge
            variant="secondary"
            className="absolute top-4 left-4 bg-primary/80 backdrop-blur-sm text-primary-foreground"
          >
            {serviceType}
          </Badge>
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/${locale}/services/${service.slug}`} className="block">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {!hideDescription && shortDescription && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-3">
            {shortDescription}
          </p>
        )}

        <div className="mt-auto pt-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {!hidePrice && (
              <div className="flex items-center">
                <Tag className="h-4 w-4 text-primary mr-2" />
                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {localizedPrice || formatItemPrice(service, locale)}
                </span>
              </div>
            )}

            {service.duration ? (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>
                  {service.duration}{' '}
                  {service.duration === 60
                    ? translations('duration.hour')
                    : service.duration > 60
                      ? translations('duration.hours', { hours: Math.floor(service.duration / 60) })
                      : translations('duration.minutes', { minutes: service.duration })}
                </span>
              </div>
            ) : null}
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-primary/50 hover:bg-primary/5 group mt-2"
          >
            <Link href={`/${locale}/services/${service.slug}`}>
              <span>{translations('viewDetails')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
