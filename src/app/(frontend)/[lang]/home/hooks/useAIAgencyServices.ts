'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Service } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface UseAIAgencyServicesOptions {
  limit?: number
}

interface UseAIAgencyServicesReturn {
  services: Service[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// Типы услуг, релевантные для AI Agency
const AI_AGENCY_SERVICE_TYPES = [
  'automation',
  'development',
  'integration',
  'audit',
  'consultation',
  'content_creation',
]

// Fallback данные для демонстрации
const getFallbackServices = (locale: 'en' | 'ru'): Service[] => {
  if (locale === 'en') {
    return [
      {
        id: 'fallback-1',
        title: 'AI Agents Turnkey',
        serviceType: 'automation',
        shortDescription: 'Smart assistants for business process automation',
        price: 150000,
        isPriceStartingFrom: true,
        duration: 2160,
        slug: 'ai-agents-turnkey',
        businessStatus: 'active',
      },
      {
        id: 'fallback-2',
        title: 'AI Chatbots',
        serviceType: 'development',
        shortDescription: 'Telegram, WhatsApp, Web - wherever your clients are',
        price: 80000,
        isPriceStartingFrom: true,
        duration: 1440,
        slug: 'ai-chatbots',
        businessStatus: 'active',
      },
      {
        id: 'fallback-3',
        title: 'AI Integration',
        serviceType: 'integration',
        shortDescription: 'Consulting and implementation in existing systems',
        price: 200000,
        isPriceStartingFrom: true,
        duration: 2880,
        slug: 'ai-integration',
        businessStatus: 'active',
      },
      {
        id: 'fallback-4',
        title: 'AI Audit & Analysis',
        serviceType: 'audit',
        shortDescription: 'Find where AI will bring maximum benefit',
        price: 0,
        isPriceStartingFrom: false,
        duration: 480,
        slug: 'ai-audit-free',
        businessStatus: 'active',
      },
    ] as Service[]
  }

  return [
    {
      id: 'fallback-1',
      title: 'ИИ-агенты под ключ',
      serviceType: 'automation',
      shortDescription: 'Умные помощники для автоматизации бизнес-процессов',
      price: 150000,
      isPriceStartingFrom: true,
      duration: 2160,
      slug: 'ai-agents-turnkey',
      businessStatus: 'active',
    },
    {
      id: 'fallback-2',
      title: 'Чат-боты с нейросетями',
      serviceType: 'development',
      shortDescription: 'Telegram, WhatsApp, Web - везде, где ваши клиенты',
      price: 80000,
      isPriceStartingFrom: true,
      duration: 1440,
      slug: 'ai-chatbots',
      businessStatus: 'active',
    },
    {
      id: 'fallback-3',
      title: 'Интеграция ИИ в процессы',
      serviceType: 'integration',
      shortDescription: 'Консалтинг и внедрение в существующие системы',
      price: 200000,
      isPriceStartingFrom: true,
      duration: 2880,
      slug: 'ai-integration',
      businessStatus: 'active',
    },
    {
      id: 'fallback-4',
      title: 'Аудит и поиск точек для ИИ',
      serviceType: 'audit',
      shortDescription: 'Находим, где ИИ принесет максимальную выгоду',
      price: 0,
      isPriceStartingFrom: false,
      duration: 480,
      slug: 'ai-audit-free',
      businessStatus: 'active',
    },
    {
      id: 'fallback-5',
      title: 'Автоворонки и персонализация',
      serviceType: 'automation',
      shortDescription: 'Умные воронки продаж и персональные рекомендации',
      price: 120000,
      isPriceStartingFrom: true,
      duration: 960,
      slug: 'ai-sales-funnels',
      businessStatus: 'active',
    },
    {
      id: 'fallback-6',
      title: 'ИИ-консультации',
      serviceType: 'consultation',
      shortDescription: 'Персональные консультации по внедрению ИИ',
      price: 15000,
      isPriceStartingFrom: false,
      duration: 60,
      slug: 'ai-consultation',
      businessStatus: 'active',
    },
  ] as Service[]
}

export function useAIAgencyServices({
  limit = 10,
}: UseAIAgencyServicesOptions = {}): UseAIAgencyServicesReturn {
  const locale = useLocale() as 'en' | 'ru'
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)

      // Формируем URL для получения AI-релевантных услуг
      const params = new URLSearchParams({
        businessStatus: 'active',
        locale,
        limit: limit.toString(),
      })

      const response = await fetch(`/api/v1/services?${params}`)

      if (!response.ok) {
        logWarn('Failed to fetch services from API, using fallback data')
        // Используем fallback данные, если API недоступен
        const fallbackServices = getFallbackServices(locale).slice(0, limit)
        setServices(fallbackServices)
        return
      }

      const data = await response.json()

      // Фильтруем услуги по типам, релевантным для AI Agency
      const aiServices = (data.docs || []).filter((service: Service) =>
        AI_AGENCY_SERVICE_TYPES.includes(service.serviceType),
      )

      // Если нет услуг из API, используем fallback
      if (aiServices.length === 0) {
        logWarn('No AI services found in API, using fallback data')
        const fallbackServices = getFallbackServices(locale).slice(0, limit)
        setServices(fallbackServices)
      } else {
        setServices(aiServices)
      }
    } catch (err) {
      logError('Error fetching AI Agency services:', err)
      logWarn('Using fallback data due to error')
      // В случае ошибки используем fallback данные
      const fallbackServices = getFallbackServices(locale).slice(0, limit)
      setServices(fallbackServices)
      setError(null) // Не показываем ошибку, так как у нас есть fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [locale, limit])

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  }
}
