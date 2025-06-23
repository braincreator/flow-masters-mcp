'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ServiceBookingFlow from '@/components/services/ServiceBookingFlow'
import type { BookingSettings } from '@/types/service'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type ServiceBookingInChatProps = {
  serviceType?: string
  calendlyUsername?: string
  calendlyEventType?: string
  hideEventTypeDetails?: boolean
  hideGdprBanner?: boolean
  prefill?: {
    name?: string
    email?: string
    customAnswers?: Record<string, string>
  }
  className?: string
}

export const ServiceBookingInChat: React.FC<ServiceBookingInChatProps> = ({
  serviceType = 'consultation',
  calendlyUsername,
  calendlyEventType,
  hideEventTypeDetails = true,
  hideGdprBanner = true,
  prefill,
  className = '',
}) => {
  const t = useTranslations('ServiceBooking')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState<any>(null)

  // Загружаем услугу по типу
  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Получаем услуги указанного типа
        const response = await fetch(
          `/api/v1/services?type=${serviceType}&businessStatus=active&limit=1`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch service')
        }

        const data = await response.json()

        // Проверяем, есть ли услуги
        if (!data.docs || data.docs.length === 0) {
          throw new Error('No services available')
        }

        // Берем первую услугу указанного типа
        setService(data.docs[0])
      } catch (err) {
        logError('Error fetching service:', err)
        setError(err instanceof Error ? err.message : 'Failed to load service')
      } finally {
        setIsLoading(false)
      }
    }

    fetchService()
  }, [serviceType])

  // Если загружаем услугу, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className={className}>
        <Alert>
          <AlertDescription>Загрузка информации об услуге...</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Если произошла ошибка, показываем сообщение об ошибке
  if (error || !service) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Не удалось загрузить информацию об услуге'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Создаем настройки бронирования на основе переданных параметров или данных из услуги
  const bookingSettings: BookingSettings = {
    provider: 'calendly',
    calendlyUsername: calendlyUsername || service.bookingSettings?.calendlyUsername || '',
    calendlyEventType: calendlyEventType || service.bookingSettings?.calendlyEventType || '',
    hideEventTypeDetails: hideEventTypeDetails,
    hideGdprBanner: hideGdprBanner,
  }

  // Отображаем компонент бронирования услуги
  return (
    <ServiceBookingFlow
      service={{
        ...service,
        bookingSettings: bookingSettings,
      }}
      prefill={prefill}
      className={className}
      locale="en" // Default locale, should be passed as prop in real usage
    />
  )
}

export default ServiceBookingInChat
