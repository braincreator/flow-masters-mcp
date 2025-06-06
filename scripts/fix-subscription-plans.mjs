#!/usr/bin/env node

/**
 * Script to fix subscription plans with proper localization
 * Run with: node scripts/fix-subscription-plans.mjs
 */

const API_BASE = 'http://localhost:3001'

// Данные планов услуг с правильной локализацией
const subscriptionPlans = [
  {
    name: {
      ru: 'Стартер',
      en: 'Starter',
    },
    description: {
      ru: 'Идеально для малого бизнеса, начинающего с ИИ. Базовый набор инструментов для автоматизации простых процессов.',
      en: 'Perfect for small businesses starting with AI. Basic toolkit for automating simple processes.',
    },
    features: {
      ru: [
        { feature: 'Чат-бот для одной платформы' },
        { feature: 'Базовая интеграция с CRM' },
        { feature: 'Техподдержка 30 дней' },
        { feature: 'Обучение команды (2 часа)' },
        { feature: 'Документация и инструкции' },
      ],
      en: [
        { feature: 'Chatbot for one platform' },
        { feature: 'Basic CRM integration' },
        { feature: '30 days technical support' },
        { feature: 'Team training (2 hours)' },
        { feature: 'Documentation and instructions' },
      ],
    },
    price: {
      ru: 80000,
      en: 889,
    },
    currency: {
      ru: 'RUB',
      en: 'USD',
    },
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    isPopular: false,
    metadata: {
      category: 'ai-agency',
      level: 'starter',
      prepaymentPercentage: 50,
      targetAudience: 'small-business',
    },
  },
  {
    name: {
      ru: 'Профессионал',
      en: 'Professional',
    },
    description: {
      ru: 'Для растущих компаний, готовых к серьезной автоматизации. Расширенные возможности ИИ и интеграции.',
      en: 'For growing companies ready for serious automation. Advanced AI capabilities and integrations.',
    },
    features: {
      ru: [
        { feature: 'Чат-боты для 3 платформ' },
        { feature: 'Продвинутая интеграция с CRM/ERP' },
        { feature: 'Автоматизация email-маркетинга' },
        { feature: 'Аналитика и отчеты' },
        { feature: 'Техподдержка 90 дней' },
        { feature: 'Обучение команды (8 часов)' },
        { feature: 'Настройка процессов' },
      ],
      en: [
        { feature: 'Chatbots for 3 platforms' },
        { feature: 'Advanced CRM/ERP integration' },
        { feature: 'Email marketing automation' },
        { feature: 'Analytics and reports' },
        { feature: '90 days technical support' },
        { feature: 'Team training (8 hours)' },
        { feature: 'Process setup' },
      ],
    },
    price: {
      ru: 150000,
      en: 1667,
    },
    currency: {
      ru: 'RUB',
      en: 'USD',
    },
    period: 'monthly',
    trialPeriodDays: 7,
    maxSubscriptionMonths: 0,
    autoRenew: true,
    allowCancel: true,
    isActive: true,
    isPopular: true,
    metadata: {
      category: 'ai-agency',
      level: 'professional',
      prepaymentPercentage: 30,
      targetAudience: 'medium-business',
    },
  },
  {
    name: {
      ru: 'Корпоративный',
      en: 'Enterprise',
    },
    description: {
      ru: 'Полное решение для крупных организаций. Максимальная автоматизация, индивидуальная разработка и приоритетная поддержка.',
      en: 'Complete solution for large organizations. Maximum automation, custom development and priority support.',
    },
    features: {
      ru: [
        { feature: 'Неограниченные чат-боты и интеграции' },
        { feature: 'Индивидуальная разработка ИИ-решений' },
        { feature: 'Полная автоматизация бизнес-процессов' },
        { feature: 'Выделенный менеджер проекта' },
        { feature: 'Приоритетная техподдержка 24/7' },
        { feature: 'Обучение команды (40 часов)' },
        { feature: 'Консультации по стратегии ИИ' },
        { feature: 'SLA гарантии' },
      ],
      en: [
        { feature: 'Unlimited chatbots and integrations' },
        { feature: 'Custom AI solution development' },
        { feature: 'Complete business process automation' },
        { feature: 'Dedicated project manager' },
        { feature: 'Priority 24/7 technical support' },
        { feature: 'Team training (40 hours)' },
        { feature: 'AI strategy consultations' },
        { feature: 'SLA guarantees' },
      ],
    },
    price: {
      ru: 300000,
      en: 3333,
    },
    currency: {
      ru: 'RUB',
      en: 'USD',
    },
    period: 'monthly',
    trialPeriodDays: 14,
    maxSubscriptionMonths: 0,
    autoRenew: true,
    allowCancel: true,
    isActive: true,
    isPopular: false,
    metadata: {
      category: 'ai-agency',
      level: 'enterprise',
      prepaymentPercentage: 20,
      targetAudience: 'large-business',
    },
  },
  {
    name: {
      ru: 'Консалтинг Базовый',
      en: 'Basic Consulting',
    },
    description: {
      ru: 'Консультационные услуги для понимания возможностей ИИ в вашем бизнесе. Анализ и рекомендации.',
      en: 'Consulting services to understand AI opportunities in your business. Analysis and recommendations.',
    },
    features: {
      ru: [
        { feature: 'Анализ бизнес-процессов (до 5 процессов)' },
        { feature: 'Рекомендации по внедрению ИИ' },
        { feature: 'ROI-расчеты' },
        { feature: 'Техническое задание' },
        { feature: 'Презентация результатов' },
      ],
      en: [
        { feature: 'Business process analysis (up to 5 processes)' },
        { feature: 'AI implementation recommendations' },
        { feature: 'ROI calculations' },
        { feature: 'Technical specification' },
        { feature: 'Results presentation' },
      ],
    },
    price: {
      ru: 45000,
      en: 500,
    },
    currency: {
      ru: 'RUB',
      en: 'USD',
    },
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 1,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    isPopular: false,
    metadata: {
      category: 'consulting',
      level: 'basic',
      prepaymentPercentage: 100,
      targetAudience: 'all',
    },
  },
  {
    name: {
      ru: 'Консалтинг Премиум',
      en: 'Premium Consulting',
    },
    description: {
      ru: 'Углубленный консалтинг с разработкой стратегии внедрения ИИ и сопровождением проекта.',
      en: 'In-depth consulting with AI implementation strategy development and project support.',
    },
    features: {
      ru: [
        { feature: 'Полный аудит всех бизнес-процессов' },
        { feature: 'Стратегия внедрения ИИ на 12 месяцев' },
        { feature: 'Детальные ROI-расчеты' },
        { feature: 'Техническое задание + архитектура' },
        { feature: 'Сопровождение проекта 3 месяца' },
        { feature: 'Обучение команды' },
      ],
      en: [
        { feature: 'Complete audit of all business processes' },
        { feature: '12-month AI implementation strategy' },
        { feature: 'Detailed ROI calculations' },
        { feature: 'Technical specification + architecture' },
        { feature: '3 months project support' },
        { feature: 'Team training' },
      ],
    },
    price: {
      ru: 120000,
      en: 1333,
    },
    currency: {
      ru: 'RUB',
      en: 'USD',
    },
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 3,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    isPopular: true,
    metadata: {
      category: 'consulting',
      level: 'premium',
      prepaymentPercentage: 50,
      targetAudience: 'medium-large-business',
    },
  },
]

async function clearExistingPlans() {
  console.log('🗑️  Clearing existing subscription plans...')

  try {
    // Получаем все планы
    const response = await fetch(`${API_BASE}/api/subscription-plans?limit=100`)
    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.statusText}`)
    }

    const data = await response.json()
    const plans = data.docs || []

    // Удаляем планы, которые мы создали (с metadata.locale)
    for (const plan of plans) {
      if (
        plan.metadata &&
        (plan.metadata.locale ||
          plan.metadata.category === 'ai-agency' ||
          plan.metadata.category === 'consulting')
      ) {
        try {
          const deleteResponse = await fetch(`${API_BASE}/api/subscription-plans/${plan.id}`, {
            method: 'DELETE',
          })

          if (deleteResponse.ok) {
            console.log(`✅ Deleted plan: ${plan.name} (${plan.id})`)
          } else {
            console.error(`❌ Failed to delete plan: ${plan.name}`)
          }
        } catch (error) {
          console.error(`❌ Error deleting plan ${plan.name}:`, error.message)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error clearing plans:', error.message)
  }
}

async function createLocalizedPlans() {
  console.log('🚀 Creating properly localized subscription plans...')

  try {
    for (const planData of subscriptionPlans) {
      try {
        console.log(`Creating plan: ${planData.name.ru}/${planData.name.en}...`)

        // Создаем план для русской локали сначала
        const ruResponse = await fetch(`${API_BASE}/api/subscription-plans?locale=ru`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: planData.name.ru,
            description: planData.description.ru,
            features: planData.features.ru,
            price: planData.price.ru,
            currency: planData.currency.ru,
            period: planData.period,
            trialPeriodDays: planData.trialPeriodDays,
            maxSubscriptionMonths: planData.maxSubscriptionMonths,
            autoRenew: planData.autoRenew,
            allowCancel: planData.allowCancel,
            isActive: planData.isActive,
            isPopular: planData.isPopular,
            metadata: planData.metadata,
          }),
        })

        if (ruResponse.ok) {
          const ruResult = await ruResponse.json()
          const planId = ruResult.doc?.id
          console.log(`✅ Created RU plan: ${planData.name.ru} (ID: ${planId})`)

          // Теперь обновляем план для английской локали
          const enResponse = await fetch(`${API_BASE}/api/subscription-plans/${planId}?locale=en`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: planData.name.en,
              description: planData.description.en,
              features: planData.features.en,
              price: planData.price.en,
              currency: planData.currency.en,
            }),
          })

          if (enResponse.ok) {
            console.log(`✅ Updated EN plan: ${planData.name.en}`)
          } else {
            const enError = await enResponse.text()
            console.error(`❌ Error updating EN plan ${planData.name.en}:`, enError)
          }
        } else {
          const error = await ruResponse.text()
          console.error(`❌ Error creating plan ${planData.name.ru}:`, error)
        }
      } catch (error) {
        console.error(`❌ Error processing plan ${planData.name.ru}:`, error.message)
      }
    }

    console.log('🎉 All subscription plans processed!')
  } catch (error) {
    console.error('💥 Error:', error)
    process.exit(1)
  }
}

async function main() {
  await clearExistingPlans()
  await createLocalizedPlans()
}

// Запускаем скрипт
main()
