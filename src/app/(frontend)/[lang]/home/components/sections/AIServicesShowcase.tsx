'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { GridContainer } from '@/components/GridContainer'
import { useAIAgencyServices } from '../../hooks/useAIAgencyServices'
import { getServiceIcon, getServiceColor } from '../../utils/serviceIconMapping'
import { formatItemPrice } from '@/utilities/formatPrice'
import { Service } from '@/payload-types'

// Функции для получения CSS классов (статические для Tailwind)
function getIconBackgroundClass(color: string): string {
  const classes = {
    blue: 'w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6',
    purple: 'w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6',
    green: 'w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6',
    orange: 'w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6',
    indigo: 'w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6',
    pink: 'w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6',
    cyan: 'w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6',
    gray: 'w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6',
  }
  return classes[color as keyof typeof classes] || classes.gray
}

function getIconColorClass(color: string): string {
  const classes = {
    blue: 'w-8 h-8 text-blue-600',
    purple: 'w-8 h-8 text-purple-600',
    green: 'w-8 h-8 text-green-600',
    orange: 'w-8 h-8 text-orange-600',
    indigo: 'w-8 h-8 text-indigo-600',
    pink: 'w-8 h-8 text-pink-600',
    cyan: 'w-8 h-8 text-cyan-600',
    gray: 'w-8 h-8 text-gray-600',
  }
  return classes[color as keyof typeof classes] || classes.gray
}

function getButtonClass(color: string, isSpecial: boolean): string {
  if (isSpecial) {
    return 'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-green-600 text-white hover:bg-green-700'
  }

  const classes = {
    blue: 'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700',
    purple:
      'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-purple-600 text-white hover:bg-purple-700',
    green:
      'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-green-600 text-white hover:bg-green-700',
    orange:
      'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-orange-600 text-white hover:bg-orange-700',
    indigo:
      'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-700',
    pink: 'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-pink-600 text-white hover:bg-pink-700',
    cyan: 'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-cyan-600 text-white hover:bg-cyan-700',
    gray: 'w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-gray-600 text-white hover:bg-gray-700',
  }
  return classes[color as keyof typeof classes] || classes.gray
}

function getPriceColorClass(color: string, isSpecial: boolean): string {
  if (isSpecial) {
    return 'font-bold text-lg text-green-600'
  }

  const classes = {
    blue: 'font-bold text-lg text-blue-600',
    purple: 'font-bold text-lg text-purple-600',
    green: 'font-bold text-lg text-green-600',
    orange: 'font-bold text-lg text-orange-600',
    indigo: 'font-bold text-lg text-indigo-600',
    pink: 'font-bold text-lg text-pink-600',
    cyan: 'font-bold text-lg text-cyan-600',
    gray: 'font-bold text-lg text-gray-600',
  }
  return classes[color as keyof typeof classes] || classes.gray
}

// Функция для локализованного форматирования времени выполнения
function formatDuration(duration?: number | null, t: any, locale: 'en' | 'ru' = 'ru'): string {
  if (!duration || duration === 0) {
    return t('duration.byAgreement')
  }

  const days = Math.ceil(duration / (60 * 24)) // Конвертируем минуты в дни

  if (days <= 7) {
    return t('duration.days', { count: days })
  } else if (days <= 30) {
    const weeks = Math.ceil(days / 7)
    return t('duration.weeks', { count: weeks })
  } else {
    const months = Math.ceil(days / 30)
    return t('duration.months', { count: months })
  }
}

export function AIServicesShowcase() {
  const locale = useLocale() as 'en' | 'ru'
  const t = useTranslations('aiAgency.services')
  const { services, loading, error } = useAIAgencyServices({ limit: 6 })

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <GridContainer>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-10 border border-gray-200 shadow-lg animate-pulse"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-6"></div>
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-6"></div>
                <div className="h-4 bg-gray-200 rounded mb-6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </GridContainer>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <GridContainer>
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </GridContainer>
      </section>
    )
  }
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <GridContainer>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = getServiceIcon(service.serviceType)
            const color = getServiceColor(service.serviceType)
            const formattedPrice = formatItemPrice(service, locale)
            const duration = formatDuration(service.duration, t, locale)
            const isAuditService = service.serviceType === 'audit'

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-10 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
              >
                <div className={getIconBackgroundClass(color)}>
                  <Icon className={getIconColorClass(color)} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 min-h-[3.5rem] flex items-center">
                  {service.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  {service.shortDescription}
                </p>

                <div className="flex justify-between items-center mb-6">
                  <div className={getPriceColorClass(color, isAuditService || service.price === 0)}>
                    {service.price === 0 ? t('free') : formattedPrice}
                  </div>
                  <div className="text-gray-500 text-sm">{duration}</div>
                </div>

                <Link href={`/${locale}/services/${service.slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={getButtonClass(color, isAuditService || service.price === 0)}
                  >
                    {isAuditService || service.price === 0 ? t('getAudit') : t('order')}
                  </motion.button>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Кнопка "Посмотреть все услуги" */}
        {services.length > 0 && (
          <div className="text-center mt-12">
            <Link href={`/${locale}/services`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300"
              >
                {t('viewAllServices')}
              </motion.button>
            </Link>
          </div>
        )}
      </GridContainer>
    </section>
  )
}
