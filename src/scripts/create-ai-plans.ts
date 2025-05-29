#!/usr/bin/env tsx

/**
 * Script to create AI Agency subscription plans for testing
 * Run with: npx tsx src/scripts/create-ai-plans.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

const aiPlans = [
  {
    name: 'Стартер',
    description: 'Идеально для малого бизнеса, начинающего с ИИ',
    features: [
      { feature: 'Чат-бот для одной платформы' },
      { feature: 'Базовая интеграция с CRM' },
      { feature: 'Техподдержка 30 дней' },
      { feature: 'Обучение команды' },
      { feature: 'Документация' }
    ],
    price: 80000,
    currency: 'RUB',
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    metadata: {
      category: 'ai-agency',
      level: 'starter',
      prepaymentPercentage: 50
    }
  },
  {
    name: 'Профессионал',
    description: 'Комплексное ИИ-решение для растущего бизнеса',
    features: [
      { feature: 'ИИ-агент + чат-боты' },
      { feature: 'Полная интеграция' },
      { feature: 'Техподдержка 90 дней' },
      { feature: 'Аналитика и отчеты' },
      { feature: 'Персональный менеджер' },
      { feature: 'Обновления и доработки' }
    ],
    price: 180000,
    currency: 'RUB',
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    metadata: {
      category: 'ai-agency',
      level: 'professional',
      prepaymentPercentage: 50,
      isPopular: true
    }
  },
  {
    name: 'Корпоративный',
    description: 'Индивидуальная ИИ-экосистема для крупных организаций',
    features: [
      { feature: 'Комплексная ИИ-экосистема' },
      { feature: 'Индивидуальная разработка' },
      { feature: 'Техподдержка 12 месяцев' },
      { feature: 'Выделенная команда' },
      { feature: 'SLA гарантии' },
      { feature: 'Интеграция с корп. системами' },
      { feature: 'Обучение сотрудников' }
    ],
    price: 350000,
    currency: 'RUB',
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    metadata: {
      category: 'ai-agency',
      level: 'enterprise',
      prepaymentPercentage: 50,
      isCustom: true
    }
  },
  // English versions
  {
    name: 'Starter',
    description: 'Perfect for small businesses starting with AI',
    features: [
      { feature: 'Chatbot for one platform' },
      { feature: 'Basic CRM integration' },
      { feature: '30 days technical support' },
      { feature: 'Team training' },
      { feature: 'Documentation' }
    ],
    price: 80000,
    currency: 'RUB',
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    metadata: {
      category: 'ai-agency',
      level: 'starter',
      prepaymentPercentage: 50,
      locale: 'en'
    }
  },
  {
    name: 'Professional',
    description: 'Comprehensive AI solution for growing businesses',
    features: [
      { feature: 'AI agent + chatbots' },
      { feature: 'Full integration' },
      { feature: '90 days technical support' },
      { feature: 'Analytics and reports' },
      { feature: 'Personal manager' },
      { feature: 'Updates and improvements' }
    ],
    price: 180000,
    currency: 'RUB',
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    metadata: {
      category: 'ai-agency',
      level: 'professional',
      prepaymentPercentage: 50,
      isPopular: true,
      locale: 'en'
    }
  },
  {
    name: 'Enterprise',
    description: 'Custom AI ecosystem for large organizations',
    features: [
      { feature: 'Comprehensive AI ecosystem' },
      { feature: 'Custom development' },
      { feature: '12 months technical support' },
      { feature: 'Dedicated team' },
      { feature: 'SLA guarantees' },
      { feature: 'Corporate systems integration' },
      { feature: 'Employee training' }
    ],
    price: 350000,
    currency: 'RUB',
    period: 'monthly',
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    isActive: true,
    metadata: {
      category: 'ai-agency',
      level: 'enterprise',
      prepaymentPercentage: 50,
      isCustom: true,
      locale: 'en'
    }
  }
]

async function createAIPlans() {
  console.log('💰 Creating AI Agency subscription plans...')
  
  try {
    const payload = await getPayloadClient()
    console.log('✅ Payload client initialized')

    for (const planData of aiPlans) {
      try {
        // Проверяем, существует ли уже план с таким именем и категорией
        const existing = await payload.find({
          collection: 'subscription-plans',
          where: {
            and: [
              {
                name: {
                  equals: planData.name
                }
              },
              {
                'metadata.category': {
                  equals: 'ai-agency'
                }
              }
            ]
          },
          limit: 1
        })

        if (existing.docs.length > 0) {
          console.log(`⚠️  Plan "${planData.name}" already exists, skipping...`)
          continue
        }

        // Создаем план
        const plan = await payload.create({
          collection: 'subscription-plans',
          data: planData
        })

        console.log(`✅ Created plan: ${plan.name} (${plan.id})`)
      } catch (error) {
        console.error(`❌ Error creating plan "${planData.name}":`, error)
      }
    }

    console.log('🎉 AI Agency subscription plans creation completed!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Запускаем скрипт
createAIPlans()
