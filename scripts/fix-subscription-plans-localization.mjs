#!/usr/bin/env node

/**
 * Скрипт для правильного создания локализованных планов подписки
 * Создает документы для каждой локали отдельно
 */

import { getPayloadClient } from '../src/utilities/payload/index.js'

const subscriptionPlansData = [
  {
    id: 'starter-plan',
    ru: {
      name: 'Стартер',
      description: 'Идеально для малого бизнеса, начинающего с ИИ. Базовый набор инструментов для автоматизации простых процессов.',
      features: [
        { feature: 'ИИ-чатбот для 1 платформы' },
        { feature: 'Базовая интеграция с CRM' },
        { feature: 'Автоответчик и FAQ-бот' },
        { feature: 'Техподдержка 30 дней' },
        { feature: 'Обучение команды (4 часа)' },
        { feature: 'Настройка включена' }
      ],
      price: 89000,
      currency: 'RUB'
    },
    en: {
      name: 'Starter',
      description: 'Perfect for small businesses starting with AI. Basic toolkit for automating simple processes.',
      features: [
        { feature: 'AI chatbot for 1 platform' },
        { feature: 'Basic CRM integration' },
        { feature: 'Auto-responder and FAQ bot' },
        { feature: '30 days technical support' },
        { feature: 'Team training (4 hours)' },
        { feature: 'Setup included' }
      ],
      price: 999,
      currency: 'USD'
    },
    common: {
      period: 'monthly',
      trialPeriodDays: 7,
      maxSubscriptionMonths: 0,
      autoRenew: true,
      allowCancel: true,
      isActive: true,
      isPopular: false,
      metadata: {
        category: 'ai-agency',
        level: 'starter',
        prepaymentPercentage: 50,
        targetAudience: 'small-business'
      }
    }
  },
  {
    id: 'professional-plan',
    ru: {
      name: 'Профессиональный',
      description: 'Для растущих компаний, готовых к серьезной автоматизации. Расширенные возможности ИИ и интеграции.',
      features: [
        { feature: 'Чат-боты для 3 платформ' },
        { feature: 'Продвинутая интеграция с CRM/ERP' },
        { feature: 'Автоматизация email-маркетинга' },
        { feature: 'Аналитика и отчеты' },
        { feature: 'Техподдержка 90 дней' },
        { feature: 'Обучение команды (8 часов)' },
        { feature: 'Настройка процессов' }
      ],
      price: 150000,
      currency: 'RUB'
    },
    en: {
      name: 'Professional',
      description: 'For growing companies ready for serious automation. Advanced AI capabilities and integrations.',
      features: [
        { feature: 'Chatbots for 3 platforms' },
        { feature: 'Advanced CRM/ERP integration' },
        { feature: 'Email marketing automation' },
        { feature: 'Analytics and reports' },
        { feature: '90 days technical support' },
        { feature: 'Team training (8 hours)' },
        { feature: 'Process setup' }
      ],
      price: 1667,
      currency: 'USD'
    },
    common: {
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
        targetAudience: 'medium-business'
      }
    }
  },
  {
    id: 'enterprise-plan',
    ru: {
      name: 'Корпоративный',
      description: 'Полное решение для крупных организаций. Максимальная автоматизация, индивидуальная разработка и приоритетная поддержка.',
      features: [
        { feature: 'Неограниченные чат-боты и интеграции' },
        { feature: 'Индивидуальная разработка ИИ-решений' },
        { feature: 'Полная автоматизация бизнес-процессов' },
        { feature: 'Выделенный менеджер проекта' },
        { feature: 'Приоритетная техподдержка 24/7' },
        { feature: 'Обучение команды (40 часов)' },
        { feature: 'Консультации по стратегии ИИ' },
        { feature: 'SLA гарантии' }
      ],
      price: 300000,
      currency: 'RUB'
    },
    en: {
      name: 'Enterprise',
      description: 'Complete solution for large organizations. Maximum automation, custom development and priority support.',
      features: [
        { feature: 'Unlimited chatbots and integrations' },
        { feature: 'Custom AI solution development' },
        { feature: 'Complete business process automation' },
        { feature: 'Dedicated project manager' },
        { feature: 'Priority 24/7 technical support' },
        { feature: 'Team training (40 hours)' },
        { feature: 'AI strategy consultations' },
        { feature: 'SLA guarantees' }
      ],
      price: 3333,
      currency: 'USD'
    },
    common: {
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
        targetAudience: 'large-business'
      }
    }
  }
]

async function createLocalizedPlan(payload, planData) {
  console.log(`\n📝 Processing plan: ${planData.ru.name}`)
  
  // Сначала создаем план с русской локалью (по умолчанию)
  try {
    // Проверяем, существует ли план
    const existing = await payload.find({
      collection: 'subscription-plans',
      where: {
        'metadata.category': { equals: planData.common.metadata.category },
        'metadata.level': { equals: planData.common.metadata.level }
      },
      limit: 1
    })

    let planId
    
    if (existing.docs.length > 0) {
      console.log(`  ⚠️  Plan exists, updating...`)
      planId = existing.docs[0].id
      
      // Обновляем русскую версию
      await payload.update({
        collection: 'subscription-plans',
        id: planId,
        locale: 'ru',
        data: {
          ...planData.ru,
          ...planData.common
        }
      })
      console.log(`  ✅ Updated RU version`)
    } else {
      // Создаем новый план с русской локалью
      const created = await payload.create({
        collection: 'subscription-plans',
        locale: 'ru',
        data: {
          ...planData.ru,
          ...planData.common
        }
      })
      planId = created.id
      console.log(`  ✅ Created RU version`)
    }
    
    // Теперь создаем/обновляем английскую версию
    await payload.update({
      collection: 'subscription-plans',
      id: planId,
      locale: 'en',
      data: {
        ...planData.en,
        ...planData.common
      }
    })
    console.log(`  ✅ Updated EN version`)
    
    return planId
    
  } catch (error) {
    console.error(`  ❌ Error processing plan:`, error.message)
    throw error
  }
}

async function start() {
  try {
    console.log('🚀 Initializing Payload...')
    const payload = await getPayloadClient()
    console.log('✅ Payload initialized')

    console.log('\n📦 Creating localized subscription plans...')
    
    for (const planData of subscriptionPlansData) {
      await createLocalizedPlan(payload, planData)
    }

    console.log('\n🎉 All subscription plans created successfully!')
    console.log('\n🧪 Testing localization...')
    
    // Тестируем получение планов для разных локалей
    const ruPlans = await payload.find({
      collection: 'subscription-plans',
      locale: 'ru',
      where: { isActive: { equals: true } },
      limit: 3
    })
    
    const enPlans = await payload.find({
      collection: 'subscription-plans',
      locale: 'en', 
      where: { isActive: { equals: true } },
      limit: 3
    })
    
    console.log(`\n📊 Results:`)
    console.log(`  RU plans: ${ruPlans.docs.length} found`)
    if (ruPlans.docs.length > 0) {
      console.log(`    First plan: "${ruPlans.docs[0].name}"`)
    }
    
    console.log(`  EN plans: ${enPlans.docs.length} found`)
    if (enPlans.docs.length > 0) {
      console.log(`    First plan: "${enPlans.docs[0].name}"`)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('💥 Error:', error)
    process.exit(1)
  }
}

start()
