#!/usr/bin/env node

/**
 * Script to create optimized subscription plans with clear differentiation
 * Run with: node scripts/optimize-subscription-plans.mjs
 */

const API_BASE = 'http://localhost:3000'

// Оптимизированные планы услуг с четким разделением
const optimizedPlans = [
  {
    name: {
      ru: 'Стартер',
      en: 'Starter',
    },
    description: {
      ru: 'Идеальное решение для малого бизнеса. Базовая автоматизация с быстрым стартом.',
      en: 'Perfect solution for small business. Basic automation with quick start.',
    },
    features: {
      ru: [
        { feature: 'ИИ-чатбот для 1 платформы (Telegram/WhatsApp)' },
        { feature: 'Базовая интеграция с CRM' },
        { feature: 'Автоответчик и FAQ-бот' },
        { feature: 'Техподдержка 30 дней' },
        { feature: 'Обучение команды (4 часа)' },
        { feature: 'Настройка включена' },
      ],
      en: [
        { feature: 'AI chatbot for 1 platform (Telegram/WhatsApp)' },
        { feature: 'Basic CRM integration' },
        { feature: 'Auto-responder and FAQ bot' },
        { feature: '30 days technical support' },
        { feature: 'Team training (4 hours)' },
        { feature: 'Setup included' },
      ],
    },
    price: {
      ru: 89000,
      en: 999,
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
      ru: 'Для растущего бизнеса. Полная автоматизация продаж и маркетинга с аналитикой.',
      en: 'For growing business. Complete sales and marketing automation with analytics.',
    },
    features: {
      ru: [
        { feature: 'ИИ-чатботы для 3 платформ' },
        { feature: 'Продвинутая интеграция CRM/ERP' },
        { feature: 'Автоматизация email и SMS маркетинга' },
        { feature: 'Аналитика и отчеты в реальном времени' },
        { feature: 'Лид-скоринг и сегментация' },
        { feature: 'Техподдержка 90 дней' },
        { feature: 'Обучение команды (12 часов)' },
        { feature: 'Настройка бизнес-процессов' },
      ],
      en: [
        { feature: 'AI chatbots for 3 platforms' },
        { feature: 'Advanced CRM/ERP integration' },
        { feature: 'Email and SMS marketing automation' },
        { feature: 'Real-time analytics and reports' },
        { feature: 'Lead scoring and segmentation' },
        { feature: '90 days technical support' },
        { feature: 'Team training (12 hours)' },
        { feature: 'Business process setup' },
      ],
    },
    price: {
      ru: 189000,
      en: 2099,
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
      ru: 'Максимальное решение для крупного бизнеса. Индивидуальная разработка и приоритетная поддержка.',
      en: 'Maximum solution for large business. Custom development and priority support.',
    },
    features: {
      ru: [
        { feature: 'Неограниченные ИИ-решения и интеграции' },
        { feature: 'Индивидуальная разработка под задачи' },
        { feature: 'Полная автоматизация всех процессов' },
        { feature: 'Выделенный менеджер проекта' },
        { feature: 'Приоритетная поддержка 24/7' },
        { feature: 'Продвинутая аналитика и BI' },
        { feature: 'Обучение команды (40 часов)' },
        { feature: 'Консультации по ИИ-стратегии' },
        { feature: 'SLA гарантии 99.9%' },
        { feature: 'API доступ и интеграции' },
      ],
      en: [
        { feature: 'Unlimited AI solutions and integrations' },
        { feature: 'Custom development for specific needs' },
        { feature: 'Complete automation of all processes' },
        { feature: 'Dedicated project manager' },
        { feature: 'Priority 24/7 support' },
        { feature: 'Advanced analytics and BI' },
        { feature: 'Team training (40 hours)' },
        { feature: 'AI strategy consultations' },
        { feature: '99.9% SLA guarantees' },
        { feature: 'API access and integrations' },
      ],
    },
    price: {
      ru: 399000,
      en: 4399,
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
]

async function clearExistingPlans() {
  console.log('🗑️  Removing existing AI agency plans...')

  try {
    // Получаем все планы
    const response = await fetch(`${API_BASE}/api/subscription-plans?limit=100`)
    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.statusText}`)
    }

    const data = await response.json()
    const plans = data.docs || []

    // Удаляем планы AI-агентства
    for (const plan of plans) {
      if (plan.metadata && plan.metadata.category === 'ai-agency') {
        try {
          const deleteResponse = await fetch(`${API_BASE}/api/subscription-plans/${plan.id}`, {
            method: 'DELETE',
          })

          if (deleteResponse.ok) {
            console.log(`✅ Deleted old plan: ${plan.name?.ru || plan.name}`)
          } else {
            console.error(`❌ Failed to delete plan: ${plan.name?.ru || plan.name}`)
          }
        } catch (error) {
          console.error(`❌ Error deleting plan:`, error.message)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error clearing plans:', error.message)
  }
}

async function createOptimizedPlans() {
  console.log('🎯 Creating optimized subscription plans...')

  try {
    for (const planData of optimizedPlans) {
      try {
        console.log(`Creating plan: ${planData.name.ru}...`)

        // Создаем план для русской локали
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
          console.log(
            `✅ Created RU plan: ${planData.name.ru} - ${planData.price.ru.toLocaleString()}₽`,
          )

          // Обновляем для английской локали
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
            console.log(
              `✅ Updated EN plan: ${planData.name.en} - $${planData.price.en.toLocaleString()}`,
            )
          } else {
            console.error(`❌ Error updating EN plan ${planData.name.en}`)
          }
        } else {
          const error = await ruResponse.text()
          console.error(`❌ Error creating plan ${planData.name.ru}:`, error)
        }
      } catch (error) {
        console.error(`❌ Error processing plan ${planData.name.ru}:`, error.message)
      }
    }

    console.log('\n🎉 Optimization complete!')
    console.log('\n📊 New plan structure:')
    console.log('1. Стартер - 89,000₽ (Basic automation)')
    console.log('2. Профессионал - 189,000₽ (Full automation) ⭐')
    console.log('3. Корпоративный - 399,000₽ (Enterprise solution)')
    console.log('\n✨ Clear pricing tiers with no overlaps!')
  } catch (error) {
    console.error('💥 Error:', error)
    process.exit(1)
  }
}

async function main() {
  await clearExistingPlans()
  await createOptimizedPlans()
}

// Запускаем скрипт
main()
