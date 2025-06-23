'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { SubscriptionPlan } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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
  // Получаем процент предоплаты из метаданных или используем 50% по умолчанию
  const prepaymentPercentage = (plan.metadata as any)?.prepaymentPercentage || 50
  const prepayment = Math.round(plan.price * (prepaymentPercentage / 100))

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description || undefined,
    price: plan.price,
    prepayment,
    currency: plan.currency,
    features: plan.features?.map((f) => f.feature) || [],
    isPopular: plan.isPopular ?? false,
    isActive: (plan as any).isActive !== false,
    originalPlan: plan,
  }
}

// Fallback данные для демонстрации (обновленные цены)
const getFallbackPlans = (locale: 'en' | 'ru'): AIAgencyPlan[] => {
  if (locale === 'en') {
    return [
      {
        id: 'starter-en',
        name: 'Starter',
        description: 'Perfect solution for small business',
        price: 999,
        prepayment: 500,
        currency: 'USD',
        features: [
          'AI chatbot for 1 platform',
          'Basic CRM integration',
          'Auto-responder and FAQ bot',
          '30 days technical support',
          'Team training (4 hours)',
          'Setup included',
        ],
        isPopular: false,
        isActive: true,
        originalPlan: {} as SubscriptionPlan,
      },
      {
        id: 'professional-en',
        name: 'Professional',
        description: 'For growing business with complete automation',
        price: 2099,
        prepayment: 630,
        currency: 'USD',
        features: [
          'AI chatbots for 3 platforms',
          'Advanced CRM/ERP integration',
          'Email and SMS marketing automation',
          'Real-time analytics and reports',
          'Lead scoring and segmentation',
          '90 days technical support',
          'Team training (12 hours)',
          'Business process setup',
        ],
        isPopular: true,
        isActive: true,
        originalPlan: {} as SubscriptionPlan,
      },
      {
        id: 'enterprise-en',
        name: 'Enterprise',
        description: 'Maximum solution for large business',
        price: 4399,
        prepayment: 880,
        currency: 'USD',
        features: [
          'Unlimited AI solutions',
          'Custom development for specific needs',
          'Complete automation of all processes',
          'Dedicated project manager',
          'Priority 24/7 support',
          'Advanced analytics and BI',
          'Team training (40 hours)',
          'AI strategy consultations',
          '99.9% SLA guarantees',
          'API access and integrations',
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
      description: 'Идеальное решение для малого бизнеса',
      price: 89000,
      prepayment: 44500,
      currency: 'RUB',
      features: [
        'ИИ-чатбот для 1 платформы',
        'Базовая интеграция с CRM',
        'Автоответчик и FAQ-бот',
        'Техподдержка 30 дней',
        'Обучение команды (4 часа)',
        'Настройка включена',
      ],
      isPopular: false,
      isActive: true,
      originalPlan: {} as SubscriptionPlan,
    },
    {
      id: 'professional-ru',
      name: 'Профессионал',
      description: 'Для растущего бизнеса с полной автоматизацией',
      price: 189000,
      prepayment: 56700,
      currency: 'RUB',
      features: [
        'ИИ-чатботы для 3 платформ',
        'Продвинутая интеграция CRM/ERP',
        'Автоматизация email и SMS',
        'Аналитика в реальном времени',
        'Лид-скоринг и сегментация',
        'Техподдержка 90 дней',
        'Обучение команды (12 часов)',
        'Настройка бизнес-процессов',
      ],
      isPopular: true,
      isActive: true,
      originalPlan: {} as SubscriptionPlan,
    },
    {
      id: 'enterprise-ru',
      name: 'Корпоративный',
      description: 'Максимальное решение для крупного бизнеса',
      price: 399000,
      prepayment: 79800,
      currency: 'RUB',
      features: [
        'Неограниченные ИИ-решения',
        'Индивидуальная разработка',
        'Полная автоматизация процессов',
        'Выделенный менеджер проекта',
        'Приоритетная поддержка 24/7',
        'Продвинутая аналитика и BI',
        'Обучение команды (40 часов)',
        'Консультации по ИИ-стратегии',
        'SLA гарантии 99.9%',
        'API доступ и интеграции',
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
      logDebug('Loading AI Agency plans for locale:', locale)

      // Формируем URL для получения планов из нашего API
      const params = new URLSearchParams({
        status: 'active',
        category: 'ai-agency',
        limit: limit.toString(),
      })

      const response = await fetch(`/api/v1/subscription/plans?${params}`)

      if (!response.ok) {
        logWarn(
          'Failed to fetch plans from API, using fallback data. Status:',
          response.status,
        )
        // Используем fallback данные, если API недоступен
        const fallbackPlans = getFallbackPlans(locale).slice(0, limit)
        logDebug('Using fallback plans:', fallbackPlans.length)
        setPlans(fallbackPlans)
        return
      }

      const data = await response.json()

      if (data.success && data.data?.docs && Array.isArray(data.data.docs)) {
        // Адаптируем планы для AI Agency
        const aiPlans = data.data.docs
          .filter((plan: SubscriptionPlan) => plan.isActive !== false)
          .map(adaptSubscriptionPlanToAIAgency)
          .slice(0, limit)

        // Если нет планов из API, используем fallback
        if (aiPlans.length === 0) {
          logWarn('No active AI agency plans found in API, using fallback data')
          const fallbackPlans = getFallbackPlans(locale).slice(0, limit)
          setPlans(fallbackPlans)
        } else {
          logDebug('Loaded plans from API:', aiPlans.length)
          setPlans(aiPlans)
        }
      } else {
        // Если структура ответа не соответствует ожидаемой, используем fallback
        logWarn('Invalid API response format, using fallback data')
        const fallbackPlans = getFallbackPlans(locale).slice(0, limit)
        setPlans(fallbackPlans)
      }
    } catch (err) {
      logError('Error loading AI Agency plans:', err)
      logWarn('Using fallback data due to error')
      // В случае ошибки используем fallback данные
      const fallbackPlans = getFallbackPlans(locale).slice(0, limit)
      logDebug('Fallback plans loaded:', fallbackPlans.length, 'for locale:', locale)
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
