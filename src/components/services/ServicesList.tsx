'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from '@/providers/LocaleProvider'
import { Service } from '@/types/service'
import ServiceCard from './ServiceCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type ServicesListProps = {
  serviceType?: string
  limit?: number
  className?: string
}

export const ServicesList: React.FC<ServicesListProps> = ({
  serviceType,
  limit = 6,
  className = '',
}) => {
  const t = useTranslations('Services')
  const { locale } = useLocale()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)

        // Формируем URL с параметрами, включая локаль
        // Используем businessStatus=active для получения активных записей
        let url = `/api/services?businessStatus=active&locale=${locale}`

        if (serviceType) {
          url += `&type=${serviceType}`
        }

        if (limit) {
          url += `&limit=${limit}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Failed to fetch services')
        }

        const data = await response.json()
        setServices(data.docs || [])
      } catch (err) {
        logError('Error fetching services:', err)
        setError('Failed to load services')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [serviceType, limit, locale])

  // Отображаем скелетон во время загрузки
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex justify-between mb-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Отображаем ошибку, если она есть
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Отображаем сообщение, если услуг нет
  if (services.length === 0) {
    return (
      <Alert className={className}>
        <AlertDescription>{t('noServices')}</AlertDescription>
      </Alert>
    )
  }

  // Отображаем список услуг
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  )
}

export default ServicesList
