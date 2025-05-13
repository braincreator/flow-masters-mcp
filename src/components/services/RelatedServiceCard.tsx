'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, convertPrice, getLocaleCurrency } from '@/utilities/formatPrice'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { Image } from '@/components/Image'
import { Badge } from '@/components/ui/badge'

type RelatedServiceCardProps = {
  service: any
  locale: string
  translations?: Record<string, string>
  variant?: 'default' | 'minimal' | 'accent'
}

export default function RelatedServiceCard({
  service,
  locale,
  translations = {},
  variant = 'default',
}: RelatedServiceCardProps) {
  const [localizedPrice, setLocalizedPrice] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

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
    const fetchLocalizedPrice = async () => {
      try {
        await getLocaleCurrency(locale) 
        const sourceLocaleForPrice = 'en'
        const priceInTargetCurrency = convertPrice(service.price, sourceLocaleForPrice, locale)
        setLocalizedPrice(formatPrice(priceInTargetCurrency, locale))
      } catch (error) {
        console.error('Error formatting price:', error)
        setLocalizedPrice(formatPrice(service.price, locale))
      } finally {
        setIsLoaded(true)
      }
    }
    
    fetchLocalizedPrice()
  }, [service.price, locale])

  // Получаем переводы из пропсов или используем дефолтные значения
  const t = (key: string): string => {
    return translations[key] || key
  }

  // Минимальный вариант карточки связанной услуги
  if (variant === 'minimal') {
    return (
      <Link
        href={`/${locale}/services/${service.slug}`}
        className="group flex items-start gap-4 p-3 rounded-lg border border-border/10 hover:border-primary/20 bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-md"
      >
        <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
          <Image
            src={thumbnailUrl}
            alt={title as string}
            fill={true}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="64px"
          />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          {service.price > 0 && (
            <div className="text-primary font-semibold text-sm mt-1">
              {isLoaded ? localizedPrice : 
                <span className="inline-block w-16 h-4 bg-primary/10 animate-pulse rounded"></span>}
            </div>
          )}
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs text-muted-foreground line-clamp-1">{shortDescription}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    )
  }

  // Вариант с акцентом
  if (variant === 'accent') {
    return (
      <Link
        href={`/${locale}/services/${service.slug}`}
        className="group block relative overflow-hidden bg-card rounded-xl shadow-md border border-primary/20 hover:shadow-lg hover:border-primary/60 transition-all"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
        
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={title as string}
            fill={true}
            className="object-cover transition-transform duration-700 group-hover:scale-110 z-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
          
          {service.serviceType && (
            <Badge 
              className="absolute top-3 right-3 z-20 bg-primary/90 text-white border-none px-2.5 py-1 text-xs uppercase tracking-wider font-medium shadow-sm"
            >
              {service.serviceType}
            </Badge>
          )}
        </div>
        
        <div className="relative z-20 p-5">
          <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {shortDescription && (
            <p className="text-muted-foreground line-clamp-2 text-sm mb-3 group-hover:text-foreground/80 transition-colors">
              {shortDescription}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            {service.price > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary" />
                <span className="font-bold text-primary">
                  {isLoaded ? localizedPrice : 
                    <span className="inline-block w-16 h-5 bg-primary/10 animate-pulse rounded"></span>}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-primary font-medium text-sm ml-auto group-hover:translate-x-1 transition-transform duration-300">
              {t('details')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
          
          {service.duration && (
            <div className="absolute top-5 left-5 flex items-center bg-black/40 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              <Clock className="h-3 w-3 mr-1" />
              <span>{service.duration} мин</span>
            </div>
          )}
        </div>
      </Link>
    )
  }

  // Стандартный вариант (default)
  return (
    <Link
      href={`/${locale}/services/${service.slug}`}
      className="block bg-card rounded-xl shadow-md border border-border/10 hover:shadow-lg hover:border-primary/20 transition-all group overflow-hidden relative"
    >
      {/* Декоративный градиент при наведении */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="relative aspect-[4/3]">
        <Image
          src={thumbnailUrl}
          alt={title as string}
          fill={true}
          className="object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-semibold text-lg text-white group-hover:text-primary-foreground transition-colors">{title}</h3>
          {service.price > 0 && isLoaded && (
            <div className="mt-1 bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-md inline-block text-white text-sm">
              {localizedPrice}
            </div>
          )}
          {service.price > 0 && !isLoaded && (
            <div className="mt-1 inline-block w-20 h-7 bg-primary/40 animate-pulse rounded-md"></div>
          )}
        </div>
      </div>
      <div className="p-4">
        {shortDescription && (
          <p className="text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
            {shortDescription}
          </p>
        )}
        <div className="mt-4 text-primary flex items-center justify-end text-sm font-medium">
          {t('details')}
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1.5 duration-300" />
        </div>
      </div>
    </Link>
  )
} 