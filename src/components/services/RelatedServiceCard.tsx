'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, convertPrice, getLocaleCurrency } from '@/utilities/formatPrice'
import {
  ArrowRight,
  Clock,
  Tag,
  Sparkles,
  Star,
  Award,
  Check,
  Shield,
  TrendingUp,
} from 'lucide-react'
import { Image } from '@/components/Image'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Service } from '@/types/service'

// Константы стилей для компонента
const CARD_VARIANT_STYLES = {
  default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md',
  minimal: 'bg-gray-50 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 hover:shadow-sm',
  accent: 'bg-primary/5 border-primary/20 dark:border-primary/30 hover:shadow-md',
}

const TITLE_VARIANT_STYLES = {
  default: 'text-gray-800 dark:text-gray-200',
  minimal: 'text-gray-700 dark:text-gray-300',
  accent: 'text-primary dark:text-primary-foreground',
}

type RelatedServiceCardProps = {
  service: Service,
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
  const [imageError, setImageError] = useState(false)

  // Используем хук useTranslations для получения переводов
  const servicesT = useTranslations('Services')

  useEffect(() => {
    const fetchLocalizedPrice = async () => {
      try {
        await getLocaleCurrency(locale)
        const sourceLocaleForPrice = 'en'
        const priceInTargetCurrency = convertPrice(service.price, sourceLocaleForPrice, locale)
        setLocalizedPrice(formatPrice(priceInTargetCurrency, locale))
      } catch (error) {
        console.error('Error formatting price:', error)
        // Используем запасной вариант форматирования
        setLocalizedPrice(formatPrice(service.price || 0, locale))
      } finally {
        setIsLoaded(true)
      }
    }

    fetchLocalizedPrice()
  }, [service, locale])

  // Безопасное получение URL изображения с проверкой типа
  const thumbnailUrl = service.thumbnail
    ? typeof service.thumbnail === 'string'
      ? service.thumbnail
      : service.thumbnail.url || ''
    : ''

  // Локализованное название и описание
  const title =
    typeof service.title === 'object' && service.title !== null
      ? (service.title as any)[locale] || (service.title as any).en || 'Service'
      : service.title || 'Service'

  const shortDescription =
    typeof service.shortDescription === 'object' && service.shortDescription !== null
      ? (service.shortDescription as any)[locale] || (service.shortDescription as any).en || ''
      : service.shortDescription || ''

  // Функция для форматирования продолжительности услуги
  const formatDuration = (duration: number) => {
    if (!duration) return ''

    try {
      if (duration === 60) {
        return servicesT('duration.hour')
      } else if (duration > 60) {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60

        if (minutes === 0) {
          return servicesT('duration.hours', { hours })
        } else {
          // Если есть и часы, и минуты
          return servicesT('duration.hoursAndMinutes', {
            hours,
            minutes,
            hoursText: servicesT('duration.hours', { hours }),
            minutesText: servicesT('duration.minutes', { minutes }),
          })
        }
      } else {
        return servicesT('duration.minutes', { minutes: duration })
      }
    } catch (error) {
      // Резервный вариант, если переводы не работают
      if (duration === 60) {
        return '1 час'
      } else if (duration > 60) {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60
        return minutes === 0 ? `${hours} ч.` : `${hours} ч. ${minutes} мин.`
      } else {
        return `${duration} мин.`
      }
    }
  }

  // Безопасное получение переводов с поддержкой пользовательских переводов
  const getTranslation = (key: string, fallback: string) => {
    // Сначала проверяем переводы, переданные через props
    if (translations && key in translations && translations[key]) {
      return translations[key]
    }

    // Затем пытаемся использовать глобальные переводы
    try {
      return servicesT(key, { fallback })
    } catch (error) {
      return fallback
    }
  }

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setImageError(true)
  }

  // Определяем флаги для бейджей
  const isFeatured = service.isFeatured || service.isPopular
  const isNew =
    service.isNew ||
    (service.createdAt &&
      new Date(service.createdAt).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 30)

  // Получение типа услуги с локализацией
  const getServiceTypeName = (type: string): string => {
    try {
      return servicesT(`serviceTypes.${type}`)
    } catch (error) {
      return type.replace('_', ' ')
    }
  }

  const serviceType = service.serviceType
    ? getServiceTypeName(service.serviceType)
    : getServiceTypeName('other')

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className={`rounded-xl overflow-hidden border group transition-all duration-300 flex flex-col h-full relative shadow-sm ${CARD_VARIANT_STYLES[variant]}`}
    >
      {/* Декоративная линия сверху */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 to-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Основной контент карточки */}
      <div className="flex flex-col h-full">
        {/* Изображение с градиентом */}
        {thumbnailUrl && !imageError ? (
          <div className="relative h-44 w-full overflow-hidden">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>

            {/* Бейджи и метки */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              {service.serviceType && (
                <Badge className="bg-primary/90 text-white border-none px-2.5 py-1 text-xs tracking-wider font-medium shadow-sm">
                  {serviceType}
                </Badge>
              )}

              {isFeatured && (
                <Badge className="bg-amber-500/90 text-white border-none px-2.5 py-1 text-xs flex items-center gap-1 shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  <span>{getTranslation('featured', 'Featured')}</span>
                </Badge>
              )}

              {isNew && (
                <Badge className="bg-green-500/90 text-white border-none px-2.5 py-1 text-xs shadow-sm">
                  {getTranslation('newService', 'New')}
                </Badge>
              )}
            </div>

            {/* Продолжительность */}
            {service.duration && (
              <motion.div
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className="absolute top-3 right-3 flex items-center bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10"
              >
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDuration(service.duration)}</span>
              </motion.div>
            )}

            {/* Цена */}
            <div className="absolute bottom-3 left-3 z-10">
              {isLoaded ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-primary/80 backdrop-blur-sm px-3 py-1.5 rounded-md inline-block text-white text-sm font-medium shadow-sm"
                >
                  {service.isPriceStartingFrom && (
                    <span className="text-xs text-white/80 mr-1">
                      {getTranslation('startingFrom', 'from')}
                    </span>
                  )}
                  {localizedPrice}
                </motion.div>
              ) : (
                <div className="inline-block w-20 h-7 bg-primary/40 animate-pulse rounded-md"></div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative h-44 w-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
            <span className="text-4xl text-primary/40">{title.charAt(0)}</span>

            {service.serviceType && (
              <Badge className="absolute top-3 left-3 bg-primary/80 text-white border-none px-2.5 py-1 text-xs uppercase tracking-wider font-medium shadow-sm">
                {serviceType}
              </Badge>
            )}
          </div>
        )}

        {/* Текстовый контент */}
        <div className="p-4 flex flex-col flex-grow">
          <Link href={`/${locale}/services/${service.slug}`} className="group block">
            <h3
              className={`text-lg font-semibold mb-2 group-hover:text-primary transition-colors ${TITLE_VARIANT_STYLES[variant]}`}
            >
              {title}
            </h3>
          </Link>

          {shortDescription && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
              {shortDescription}
            </p>
          )}

          {/* Метки характеристик */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {service.rating && (
              <div className="text-xs flex items-center px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                <Star className="h-3 w-3 mr-1 fill-current" />
                <span>{service.rating}/5</span>
              </div>
            )}

            {service.isPopular && (
              <div className="text-xs flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{getTranslation('popular', 'Popular')}</span>
              </div>
            )}

            {service.flexible && (
              <div className="text-xs flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                <Check className="h-3 w-3 mr-1" />
                <span>{getTranslation('flexible', 'Flexible')}</span>
              </div>
            )}
          </div>

          {/* Ссылка на детали */}
          <motion.div
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="flex justify-end mt-3 pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <Link
              href={`/${locale}/services/${service.slug}`}
              className="text-primary hover:text-primary-dark text-sm font-medium flex items-center group"
            >
              {getTranslation('details', 'Details')}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
