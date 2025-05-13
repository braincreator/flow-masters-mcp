'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, convertPrice } from '@/utilities/formatPrice'
import { ArrowRight } from 'lucide-react'
import { Image } from '@/components/Image'

type RelatedServiceCardProps = {
  service: any
  locale: string
  translations?: Record<string, string>
}

export default function RelatedServiceCard({
  service,
  locale,
  translations = {},
}: RelatedServiceCardProps) {
  const [localizedPrice, setLocalizedPrice] = useState<string>('')

  // Получаем локализованные данные
  const title =
    typeof service.title === 'object' && service.title !== null
      ? service.title[locale as keyof typeof service.title] || 
        // Если нет перевода для текущей локали, берем первое доступное значение
        (typeof service.title === 'object' ? 
          Object.values(service.title)[0] || String(service.title) : 
          String(service.title))
      : service.title

  const shortDescription =
    typeof service.shortDescription === 'object' && service.shortDescription !== null
      ? service.shortDescription[locale as keyof typeof service.shortDescription] ||
        // Если нет перевода для текущей локали, берем первое доступное значение
        (typeof service.shortDescription === 'object' ? 
          Object.values(service.shortDescription)[0] || String(service.shortDescription) : 
          String(service.shortDescription))
      : service.shortDescription || ''

  // Преобразуем URL изображения
  let thumbnailUrl = '/images/placeholder-service.jpg'
  if (service.thumbnail) {
    if (typeof service.thumbnail === 'string') {
      thumbnailUrl = service.thumbnail
    } else if (
      typeof service.thumbnail === 'object' &&
      service.thumbnail !== null &&
      'url' in service.thumbnail
    ) {
      thumbnailUrl = service.thumbnail.url || thumbnailUrl
    }
  }

  // Локализация цены с конвертацией валюты
  useEffect(() => {
    const sourceLocaleForPrice = 'en'
    const priceInTargetCurrency = convertPrice(service.price, sourceLocaleForPrice, locale)
    setLocalizedPrice(formatPrice(priceInTargetCurrency, locale))
  }, [service.price, locale])

  // Получаем переводы из пропсов или используем дефолтные значения
  const t = (key: string): string => {
    return translations[key] || key
  }

  return (
    <Link
      href={`/${locale}/services/${service.slug}`}
      className="block bg-card rounded-xl shadow-md border border-border/10 hover:shadow-lg hover:border-primary/20 transition-all group overflow-hidden"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={thumbnailUrl}
          alt={title as string}
          fill={true}
          className="object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-semibold text-lg text-white">{title}</h3>
          {service.price > 0 && (
            <div className="mt-1 bg-primary/70 px-2 py-1 rounded-md inline-block text-white text-sm">
              {localizedPrice}
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        {shortDescription && (
          <p className="text-muted-foreground line-clamp-2">{shortDescription}</p>
        )}
        <div className="mt-4 text-primary flex items-center justify-end text-sm font-medium group">
          {t('details')}
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
} 