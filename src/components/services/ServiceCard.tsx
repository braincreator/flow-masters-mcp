'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, convertPrice } from '@/utilities/formatPrice'
import { Button } from '@/components/ui/button'
import { Service } from '@/types/service'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock } from 'lucide-react'
import { Image } from '@/components/Image'

type ServiceCardProps = {
  service: Service
  locale?: string
  translations?: Record<string, string>
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  locale = 'ru',
  translations = {},
}) => {
  const [localizedPrice, setLocalizedPrice] = useState<string>('')

  // Получаем локализованные данные
  const title =
    typeof service.title === 'object' && service.title !== null
      ? service.title[locale as keyof typeof service.title] || String(service.title)
      : service.title

  const shortDescription =
    typeof service.shortDescription === 'object' && service.shortDescription !== null
      ? service.shortDescription[locale as keyof typeof service.shortDescription] ||
        String(service.shortDescription)
      : service.shortDescription || ''

  // Формируем URL услуги
  const serviceUrl = `/${locale}/services/${service.slug}`

  // Преобразуем URL изображения
  const thumbnailUrl: string = service.thumbnail
    ? typeof service.thumbnail === 'string'
      ? service.thumbnail
      : typeof service.thumbnail === 'object' &&
          service.thumbnail !== null &&
          'url' in service.thumbnail
        ? String(service.thumbnail.url)
        : '/images/placeholder-service.jpg'
    : '/images/placeholder-service.jpg'

  // Локализация цены с конвертацией валюты
  useEffect(() => {
    const sourceLocaleForPrice = 'en' // предполагаем, что базовая валюта привязана к английской локали
    const priceInTargetCurrency = convertPrice(service.price, sourceLocaleForPrice, locale)
    setLocalizedPrice(formatPrice(priceInTargetCurrency, locale))
  }, [service.price, locale])

  // Получаем переводы из пропсов или используем дефолтные значения
  const t = (key: string): string => {
    // Для типов услуг используем специальный формат ключа
    if (key.startsWith('serviceTypes.')) {
      const fullKey = key // полный ключ (например 'serviceTypes.consulting')
      const fallback = key.split('.')[1] || key
      return translations[fullKey] || fallback
    }
    return translations[key] || key
  }

  return (
    <div className="h-full bg-card rounded-xl shadow-md border border-border/10 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={title as string}
          fill={true}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-black/50 text-white border-none">
            {t(`serviceTypes.${service.serviceType}`)}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold mb-1 text-white">{title}</h3>
          <p className="text-white/80 text-sm line-clamp-2">{shortDescription}</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-primary">
            {localizedPrice || formatPrice(service.price, locale)}
          </span>
          {service.duration && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {service.duration} {t('minutes')}
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary group/details"
            asChild
          >
            <Link href={serviceUrl} className="flex items-center justify-center">
              {t('details')}
              <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover/details:translate-x-1" />
            </Link>
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" asChild>
            <Link href={`${serviceUrl}/book`}>
              {service.requiresBooking ? t('book') : t('order')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
