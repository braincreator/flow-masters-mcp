#!/usr/bin/env node

/**
 * Скрипт для очистки старых записей subscription-plans в админ панели
 * и создания новых AI Agency планов
 */

const path = require('path')

// Устанавливаем переменные окружения
process.env.NODE_ENV = 'development'
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'your-secret-key'

async function cleanupSubscriptionPlans() {
  try {
    console.log('🧹 Starting cleanup of subscription plans...\n')

    // Динамически импортируем Payload
    const { getPayload } = await import('payload')
    const config = await import('../src/payload.config.ts')
    
    // Инициализируем Payload
    const payload = await getPayload({
      config: config.default,
    })

    console.log('✅ Payload initialized successfully\n')

    // 1. Получаем все существующие планы
    console.log('📋 Fetching existing subscription plans...')
    const existingPlans = await payload.find({
      collection: 'subscription-plans',
      limit: 100,
    })

    console.log(`Found ${existingPlans.docs.length} existing plans:`)
    existingPlans.docs.forEach(plan => {
      console.log(`  - ${plan.id}: ${plan.name} (${plan.price} ${plan.currency})`)
    })

    // 2. Удаляем все старые планы
    if (existingPlans.docs.length > 0) {
      console.log('\n🗑️  Deleting old plans...')
      for (const plan of existingPlans.docs) {
        await payload.delete({
          collection: 'subscription-plans',
          id: plan.id,
        })
        console.log(`  ✅ Deleted: ${plan.name}`)
      }
    }

    // 3. Создаем новые AI Agency планы
    console.log('\n🆕 Creating new AI Agency plans...')

    const newPlans = [
      // Русские планы
      {
        name: {
          ru: 'Стартер',
          en: 'Starter'
        },
        description: {
          ru: 'Идеальное решение для малого бизнеса',
          en: 'Perfect solution for small business'
        },
        features: {
          ru: [
            { feature: 'ИИ-чатбот для 1 платформы' },
            { feature: 'Базовая интеграция с CRM' },
            { feature: 'Автоответчик и FAQ-бот' },
            { feature: 'Техподдержка 30 дней' },
            { feature: 'Обучение команды (4 часа)' },
            { feature: 'Настройка включена' }
          ],
          en: [
            { feature: 'AI chatbot for 1 platform' },
            { feature: 'Basic CRM integration' },
            { feature: 'Auto-responder and FAQ bot' },
            { feature: '30 days technical support' },
            { feature: 'Team training (4 hours)' },
            { feature: 'Setup included' }
          ]
        },
        price: {
          ru: 89000,
          en: 999
        },
        currency: {
          ru: 'RUB',
          en: 'USD'
        },
        period: 'monthly',
        isActive: true,
        isPopular: false,
        trialPeriodDays: 0,
        maxSubscriptionMonths: 0,
        autoRenew: false,
        allowCancel: true,
        metadata: {
          category: 'ai-agency',
          prepaymentPercentage: 50
        }
      },
      {
        name: {
          ru: 'Профессионал',
          en: 'Professional'
        },
        description: {
          ru: 'Для растущего бизнеса с полной автоматизацией',
          en: 'For growing business with complete automation'
        },
        features: {
          ru: [
            { feature: 'ИИ-чатботы для 3 платформ' },
            { feature: 'Продвинутая интеграция CRM/ERP' },
            { feature: 'Автоматизация email и SMS' },
            { feature: 'Аналитика в реальном времени' },
            { feature: 'Лид-скоринг и сегментация' },
            { feature: 'Техподдержка 90 дней' },
            { feature: 'Обучение команды (12 часов)' },
            { feature: 'Настройка бизнес-процессов' }
          ],
          en: [
            { feature: 'AI chatbots for 3 platforms' },
            { feature: 'Advanced CRM/ERP integration' },
            { feature: 'Email and SMS marketing automation' },
            { feature: 'Real-time analytics and reports' },
            { feature: 'Lead scoring and segmentation' },
            { feature: '90 days technical support' },
            { feature: 'Team training (12 hours)' },
            { feature: 'Business process setup' }
          ]
        },
        price: {
          ru: 189000,
          en: 2099
        },
        currency: {
          ru: 'RUB',
          en: 'USD'
        },
        period: 'monthly',
        isActive: true,
        isPopular: true,
        trialPeriodDays: 0,
        maxSubscriptionMonths: 0,
        autoRenew: false,
        allowCancel: true,
        metadata: {
          category: 'ai-agency',
          prepaymentPercentage: 30
        }
      },
      {
        name: {
          ru: 'Корпоративный',
          en: 'Enterprise'
        },
        description: {
          ru: 'Максимальное решение для крупного бизнеса',
          en: 'Maximum solution for large business'
        },
        features: {
          ru: [
            { feature: 'Неограниченные ИИ-решения' },
            { feature: 'Индивидуальная разработка' },
            { feature: 'Полная автоматизация процессов' },
            { feature: 'Выделенный менеджер проекта' },
            { feature: 'Приоритетная поддержка 24/7' },
            { feature: 'Продвинутая аналитика и BI' },
            { feature: 'Обучение команды (40 часов)' },
            { feature: 'Консультации по ИИ-стратегии' },
            { feature: 'SLA гарантии 99.9%' },
            { feature: 'API доступ и интеграции' }
          ],
          en: [
            { feature: 'Unlimited AI solutions' },
            { feature: 'Custom development for specific needs' },
            { feature: 'Complete automation of all processes' },
            { feature: 'Dedicated project manager' },
            { feature: 'Priority 24/7 support' },
            { feature: 'Advanced analytics and BI' },
            { feature: 'Team training (40 hours)' },
            { feature: 'AI strategy consultations' },
            { feature: '99.9% SLA guarantees' },
            { feature: 'API access and integrations' }
          ]
        },
        price: {
          ru: 399000,
          en: 4399
        },
        currency: {
          ru: 'RUB',
          en: 'USD'
        },
        period: 'monthly',
        isActive: true,
        isPopular: false,
        trialPeriodDays: 0,
        maxSubscriptionMonths: 0,
        autoRenew: false,
        allowCancel: true,
        metadata: {
          category: 'ai-agency',
          prepaymentPercentage: 20
        }
      }
    ]

    // Создаем новые планы
    for (const planData of newPlans) {
      const createdPlan = await payload.create({
        collection: 'subscription-plans',
        data: planData,
      })
      console.log(`  ✅ Created: ${planData.name.ru} / ${planData.name.en} (ID: ${createdPlan.id})`)
    }

    console.log('\n🎉 Cleanup completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`  - Deleted: ${existingPlans.docs.length} old plans`)
    console.log(`  - Created: ${newPlans.length} new AI Agency plans`)
    
    process.exit(0)

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

// Запускаем скрипт
cleanupSubscriptionPlans()
