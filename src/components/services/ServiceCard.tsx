'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatItemPrice } from '@/utilities/formatPrice'
import { Button } from '@/components/ui/button'
import { Service } from '@/types/service'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Clock,
  Tag,
  Calendar,
  BookOpen,
  Sparkles,
  Star,
  Check,
  Shield,
  TrendingUp,
  Award,
} from 'lucide-react'
import { Image } from '@/components/Image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

// Добавляем интерфейс Media для типизации
interface Media {
  url: string
  alt?: string
}

type ServiceCardProps = {
  service: Service
  locale: string
  fullWidth?: boolean
  hidePrice?: boolean
  hideDescription?: boolean
  imageSize?: 'small' | 'medium' | 'large'
  highlighted?: boolean
}

// Константы стилей для многократного использования
const CARD_BASE_STYLES =
  'bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col h-full group'
const HIGHLIGHTED_STYLES = 'ring-2 ring-primary/50 dark:ring-primary/30 shadow-lg'
const CARD_CONTENT_STYLES = 'p-5 flex flex-col flex-grow relative'
const BADGE_BASE_STYLES = 'text-xs flex items-center px-2 py-1 rounded-md'

export default function ServiceCard({
  service,
  locale,
  fullWidth = false,
  hidePrice = false,
  hideDescription = false,
  imageSize = 'medium',
  highlighted = false,
}: ServiceCardProps) {
  const [localizedPrice, setLocalizedPrice] = useState<string>('')
  const [convertedPriceValue, setConvertedPriceValue] = useState<number>(service.price)
  const [isLoaded, setIsLoaded] = useState(false)

  // Получаем переводы на уровне компонента
  const servicesT = useTranslations('Services')

  // Безопасная функция получения перевода с fallback значениями
  const getTranslation = (key: string, fallback: string, params = {}) => {
    try {
      return servicesT(key, { fallback, ...params })
    } catch (error) {
      // В случае ошибки возвращаем fallback
      return fallback
    }
  }

  // Format price for display
  useEffect(() => {
    try {
      setLocalizedPrice(formatItemPrice(service, locale))
    } catch (error) {
      console.error('Error formatting price:', error)
      setLocalizedPrice(formatPrice(service.price || 0, locale))
    } finally {
      setIsLoaded(true)
    }
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

  // Определяем и переводим тип услуги с запасным вариантом
  const getServiceTypeName = (type: string): string => {
    return getTranslation(`serviceTypes.${type}`, type.replace('_', ' '))
  }

  const serviceType = service.serviceType
    ? getServiceTypeName(service.serviceType)
    : getServiceTypeName('other')

  // Форматируем продолжительность услуги
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

  // Определяем нужные тексты для кнопок
  const detailsText = getTranslation('details', 'View details')

  // Определяем, есть ли у услуги особые метки (бестселлер и т.д.)
  const isFeatured = service.isFeatured || service.isPopular
  const isNew =
    service.isNew ||
    (service.createdAt &&
      new Date(service.createdAt).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 30) // Меньше 30 дней

  // Функция для получения стилей бейджа по типу
  const getBadgeStyles = (
    type: 'feature' | 'new' | 'popular' | 'service' | 'flexible' | 'payment' | 'rating',
  ) => {
    switch (type) {
      case 'service':
        return 'bg-primary/90 text-primary-foreground backdrop-blur-sm'
      case 'feature':
        return 'bg-amber-500/90 text-white backdrop-blur-sm'
      case 'new':
        return 'bg-green-500/90 text-white backdrop-blur-sm'
      case 'popular':
        return `${BADGE_BASE_STYLES} text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20`
      case 'flexible':
        return `${BADGE_BASE_STYLES} text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20`
      case 'payment':
        return `${BADGE_BASE_STYLES} text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50`
      case 'rating':
        return `${BADGE_BASE_STYLES} text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20`
      default:
        return ''
    }
  }

  // Получаем размер изображения
  const getImageSizeClass = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return 'h-40'
      case 'large':
        return 'h-64'
      case 'medium':
      default:
        return 'h-52'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 30px -15px rgba(0,0,0,0.2)' }}
      className={`${CARD_BASE_STYLES} ${highlighted ? HIGHLIGHTED_STYLES : ''} ${fullWidth ? 'w-full' : ''}`}
    >
      {/* Декоративный градиент при наведении */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg"></div>

      {thumbnailUrl && (
        <div className={`relative w-full ${getImageSizeClass(imageSize)} overflow-hidden`}>
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Градиент поверх изображения */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>

          {/* Метки в верхнем левом углу */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className={getBadgeStyles('service')}>
              {serviceType}
            </Badge>

            {isFeatured && (
              <Badge variant="secondary" className={getBadgeStyles('feature')}>
                <Sparkles className="h-3 w-3 mr-1" />
                {getTranslation('featured', 'Featured')}
              </Badge>
            )}

            {isNew && (
              <Badge variant="secondary" className={getBadgeStyles('new')}>
                {getTranslation('newService', 'New')}
              </Badge>
            )}
          </div>

          {/* Продолжительность в верхнем правом углу */}
          {service.duration && (
            <div className="absolute top-4 right-4 flex items-center bg-black/40 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDuration(service.duration)}</span>
            </div>
          )}

          {/* Цена внизу изображения */}
          {!hidePrice && service.price > 0 && (
            <div className="absolute bottom-4 left-4 right-4">
              {isLoaded ? (
                <div className="mt-1 bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-md inline-block text-white text-sm">
                  {localizedPrice}
                </div>
              ) : (
                <div className="mt-1 inline-block w-20 h-7 bg-primary/40 animate-pulse rounded-md"></div>
              )}
            </div>
          )}
        </div>
      )}

      <div className={CARD_CONTENT_STYLES}>
        <Link href={`/${locale}/services/${service.slug}`} className="group block">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {!hideDescription && shortDescription && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-3">
            {shortDescription}
          </p>
        )}

        <div className="mt-auto pt-3 flex flex-col gap-4">
          {/* Метаданные и характеристики услуги */}
          <div className="flex flex-wrap gap-2 mt-1 mb-2">
            {service.rating && (
              <div className={getBadgeStyles('rating')}>
                <Star className="h-3 w-3 mr-1 fill-current" />
                <span className="font-medium">{service.rating}/5</span>
              </div>
            )}

            {service.flexible && (
              <div className={getBadgeStyles('flexible')}>
                <Check className="h-3 w-3 mr-1" />
                <span>{getTranslation('flexible', 'Flexible schedule')}</span>
              </div>
            )}

            {service.paymentRequired !== undefined && (
              <div className={getBadgeStyles('payment')}>
                <Shield className="h-3 w-3 mr-1" />
                <span>
                  {service.paymentRequired
                    ? getTranslation('paymentRequired', 'Payment required')
                    : getTranslation('noPaymentRequired', 'No prepayment')}
                </span>
              </div>
            )}

            {service.isPopular && !isFeatured && (
              <div className={getBadgeStyles('popular')}>
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{getTranslation('popular', 'Popular')}</span>
              </div>
            )}

            {service.isFeatured && !service.isPopular && (
              <div className={getBadgeStyles('rating')}>
                <Award className="h-3 w-3 mr-1" />
                <span>{getTranslation('featured', 'Featured')}</span>
              </div>
            )}
          </div>

          {/* Одна кнопка для просмотра деталей */}
          <div className="mt-2 text-primary flex items-center justify-end text-sm font-medium">
            <Link
              href={`/${locale}/services/${service.slug}`}
              className="inline-flex items-center justify-center group hover:text-primary-500 transition-colors"
            >
              {detailsText}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1.5 duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
