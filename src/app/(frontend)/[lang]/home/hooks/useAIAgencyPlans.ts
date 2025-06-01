'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { SubscriptionPlan } from '@/payload-types'

interface UseAIAgencyPlansOptions {
  limit?: number
}

interface UseAIAgencyPlansReturn {
  plans: AIAgencyPlan[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// Адаптированная структура плана для AI Agency
export interface AIAgencyPlan {
  id: string
  name: string
  description?: string
  price: number
  prepayment: number // 50% от цены
  currency: 'RUB' | 'USD' | 'EUR'
  features: string[]
  isPopular?: boolean
  isActive?: boolean
  originalPlan: SubscriptionPlan
}

// Функция для адаптации subscription-plan к AI Agency плану
function adaptSubscriptionPlanToAIAgency(plan: SubscriptionPlan): AIAgencyPlan {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description || undefined,
    price: plan.price,
    prepayment: Math.round(plan.price * 0.5), // 50% предоплата
    currency: plan.currency,
    features: plan.features?.map((f) => f.feature) || [],
    isPopular: plan.isPopular ?? false, // теперь используем свойство из Payload
    isActive: (plan as any).isActive !== false,
    originalPlan: plan,
  }
}

// Fallback данные для демонстрации
const getFallbackPlans = (locale: 'en' | 'ru'): AIAgencyPlan[] => {
  if (locale === 'en') {
    return [
      {
        id: 'starter-en',
        name: 'Starter',
        description: 'Perfect for small businesses starting with AI',
        price: 80000,
        prepayment: 40000,
        currency: 'RUB',
        features: [
          'Chatbot for one platform',
          'Basic CRM integration',
          '30 days technical support',
        ],
        isPopular: false,
        isActive: true,
        originalPlan: {} as SubscriptionPlan,
      },
      {
        id: 'professional-en',
        name: 'Professional',
        description: 'Comprehensive AI solution for growing businesses',
        price: 180000,
        prepayment: 90000,
        currency: 'RUB',
        features: ['AI agent + chatbots', 'Full integration', '90 days technical support'],
        isPopular: true,
        isActive: true,
        originalPlan: {} as SubscriptionPlan,
      },
      {
        id: 'enterprise-en',
        name: 'Enterprise',
        description: 'Custom AI ecosystem for large organizations',
        price: 350000,
        prepayment: 175000,
        currency: 'RUB',
        features: [
          'Comprehensive AI ecosystem',
          'Custom development',
          '12 months technical support',
        ],
        isPopular: false,
        isActive: true,
        originalPlan: {} as SubscriptionPlan,
      },
    ]
  }

  return [
    {
      id: 'starter-ru',
      name: 'Стартер',
      description: 'Идеально для малого бизнеса, начинающего с ИИ',
      price: 80000,
      prepayment: 40000,
      currency: 'RUB',
      features: ['Чат-бот для одной платформы', 'Базовая интеграция с CRM', 'Техподдержка 30 дней'],
      isPopular: false,
      isActive: true,
      originalPlan: {} as SubscriptionPlan,
    },
    {
      id: 'professional-ru',
      name: 'Профессионал',
      description: 'Комплексное ИИ-решение для растущего бизнеса',
      price: 180000,
      prepayment: 90000,
      currency: 'RUB',
      features: ['ИИ-агент + чат-боты', 'Полная интеграция', 'Техподдержка 90 дней'],
      isPopular: true,
      isActive: true,
      originalPlan: {} as SubscriptionPlan,
    },
    {
      id: 'enterprise-ru',
      name: 'Корпоративный',
      description: 'Индивидуальная ИИ-экосистема для крупных организаций',
      price: 350000,
      prepayment: 175000,
      currency: 'RUB',
      features: [
        'Комплексная ИИ-экосистема',
        'Индивидуальная разработка',
        'Техподдержка 12 месяцев',
      ],
      isPopular: false,
      isActive: true,
      originalPlan: {} as SubscriptionPlan,
    },
  ]
}

export function useAIAgencyPlans({
  limit = 10,
}: UseAIAgencyPlansOptions = {}): UseAIAgencyPlansReturn {
  const locale = useLocale() as 'en' | 'ru'
  const [plans, setPlans] = useState<AIAgencyPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      // Формируем URL для получения планов
      const params = new URLSearchParams({
        status: 'active',
        locale,
        limit: limit.toString(),
      })

      const response = await fetch(`/api/v1/subscription/plans?${params}`)

      if (!response.ok) {
        console.warn('Failed to fetch plans from API, using fallback data')
        // Используем fallback данные, если API недоступен
        const fallbackPlans = getFallbackPlans(locale).slice(0, limit)
        setPlans(fallbackPlans)
        return
      }

      const data = await response.json()

      if (data.success && data.plans) {
        // Адаптируем планы для AI Agency
        const aiPlans = data.plans
          .filter((plan: SubscriptionPlan) => plan.isActive !== false)
          .map(adaptSubscriptionPlanToAIAgency)
          .slice(0, limit)

        // Если нет планов из API, используем fallback
        if (aiPlans.length === 0) {
          console.warn('No active plans found in API, using fallback data')
          const fallbackPlans = getFallbackPlans(locale).slice(0, limit)
          setPlans(fallbackPlans)
        } else {
          setPlans(aiPlans)
        }
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (err) {
      console.error('Error fetching AI Agency plans:', err)
      console.warn('Using fallback data due to error')
      // В случае ошибки используем fallback данные
      const fallbackPlans = getFallbackPlans(locale).slice(0, limit)
      setPlans(fallbackPlans)
      setError(null) // Не показываем ошибку, так как у нас есть fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [locale, limit])

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  }
}
