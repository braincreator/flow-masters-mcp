#!/usr/bin/env tsx

/**
 * Script to create localized subscription plans
 * Run with: npx tsx scripts/create-subscription-plans.ts
 */

import { getPayloadClient } from '../src/utilities/payload/index'

// Инициализируем Payload
const start = async () => {
  try {
    const payload = await getPayloadClient()
    console.log('Payload initialized')

    // Данные планов услуг с локализацией
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

    // Создаем планы услуг
    for (const planData of subscriptionPlans) {
      try {
        // Проверяем, существует ли уже план с таким именем
        const existing = await payload.find({
          collection: 'subscription-plans',
          where: {
            'name.ru': {
              equals: planData.name.ru,
            },
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          console.log(`⚠️  Plan "${planData.name.ru}" already exists, updating...`)

          // Обновляем существующий план
          const updated = await payload.update({
            collection: 'subscription-plans',
            id: existing.docs[0].id,
            data: planData,
          })
          console.log(`✅ Updated plan: ${updated.name.ru}`)
        } else {
          // Создаем новый план
          const plan = await payload.create({
            collection: 'subscription-plans',
            data: planData,
          })
          console.log(`✅ Created plan: ${plan.name.ru}`)
        }
      } catch (error) {
        console.error(`❌ Error processing plan ${planData.name.ru}:`, error.message)
      }
    }

    console.log('🎉 All subscription plans processed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('💥 Initialization error:', error)
    process.exit(1)
  }
}

start()
