#!/usr/bin/env tsx

/**
 * Script to create complete AI Agency services for both locales (Russian and English)
 * Based on the full service structure from memory
 * Run with: npx tsx src/scripts/create-complete-services.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

// Функция для создания услуг для русской локали
async function createRussianServices(payload: any) {
  console.log('🇷🇺 Creating Russian services...')

  // Русские консультации (3 уровня)
  const consultationServices = [
    {
      title: 'Экспресс-консультация по ИИ',
      serviceType: 'consultation',
      shortDescription:
        'Быстрая 30-минутная оценка потенциала ИИ с выявлением приоритетных точек автоматизации',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'За 30 минут определим наиболее перспективные направления для внедрения искусственного интеллекта в ваши бизнес-процессы. Получите четкое понимание возможностей и приоритетов автоматизации.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 3000,
      isPriceStartingFrom: false,
      duration: 30,
      status: 'published',
      slug: 'express-ai-consultation-ru',
      requiresBooking: true,
      requiresPayment: true,
    },
    {
      title: 'Стандартная консультация по ИИ',
      serviceType: 'consultation',
      shortDescription:
        'Углубленный 90-минутный анализ с детальным планом внедрения и ROI-расчетами',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Комплексная консультация с глубоким анализом бизнес-процессов, детальным планом внедрения ИИ и точными расчетами эффективности.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 8000,
      isPriceStartingFrom: false,
      duration: 90,
      status: 'published',
      slug: 'standard-ai-consultation-ru',
      requiresBooking: true,
      requiresPayment: true,
    },
    {
      title: 'Премиум консультация по ИИ',
      serviceType: 'consultation',
      shortDescription:
        'VIP-сессия 3 часа с экспертом, включая стратегию, техзадание и план реализации',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Эксклюзивная консультация с топ-экспертом по ИИ. Полная стратегия внедрения, готовое техническое задание и пошаговый план реализации.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 25000,
      isPriceStartingFrom: false,
      duration: 180,
      status: 'published',
      slug: 'premium-ai-consultation-ru',
      requiresBooking: true,
      requiresPayment: true,
    },
  ]

  // Русские чат-боты (3 уровня)
  const chatbotServices = [
    {
      title: 'Базовый ИИ-чатбот',
      serviceType: 'development',
      shortDescription: 'Простой чат-бот для одной платформы с базовым ИИ и готовыми сценариями',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Создаем умного чат-бота для Telegram, WhatsApp или веб-сайта с интеграцией нейросетей и готовыми сценариями общения.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 25000,
      isPriceStartingFrom: true,
      duration: 480,
      status: 'published',
      slug: 'basic-ai-chatbot-ru',
      requiresBooking: false,
      requiresPayment: true,
    },
    {
      title: 'Стандартный ИИ-чатбот',
      serviceType: 'development',
      shortDescription: 'Продвинутый чат-бот с интеграциями, аналитикой и мультиплатформенностью',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Многофункциональный чат-бот с интеграцией CRM, аналитикой, персонализацией и поддержкой нескольких платформ.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 45000,
      isPriceStartingFrom: true,
      duration: 720,
      status: 'published',
      slug: 'standard-ai-chatbot-ru',
      requiresBooking: false,
      requiresPayment: true,
    },
    {
      title: 'Премиум ИИ-чатбот',
      serviceType: 'development',
      shortDescription:
        'Корпоративный чат-бот с продвинутым ИИ, интеграциями и полной автоматизацией',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Корпоративное решение с продвинутым ИИ, полной интеграцией с бизнес-системами, аналитикой и автоматизацией процессов.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 85000,
      isPriceStartingFrom: true,
      duration: 1440,
      status: 'published',
      slug: 'premium-ai-chatbot-ru',
      requiresBooking: false,
      requiresPayment: true,
    },
  ]

  // Создаем все русские услуги
  const allRussianServices = [...consultationServices, ...chatbotServices]

  for (const serviceData of allRussianServices) {
    try {
      const service = await payload.create({
        collection: 'services',
        data: serviceData,
        locale: 'ru',
      })
      console.log(`✅ Created Russian service: ${service.title} (${service.id})`)
    } catch (error) {
      console.error(`❌ Error creating Russian service "${serviceData.title}":`, error)
    }
  }
}

// Функция для создания услуг для английской локали
async function createEnglishServices(payload: any) {
  console.log('🇺🇸 Creating English services...')

  const englishServices = [
    {
      title: 'Express AI Consultation',
      serviceType: 'consultation',
      shortDescription:
        'Quick 30-minute AI potential assessment with priority automation points identification',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'In 30 minutes, we will identify the most promising areas for implementing artificial intelligence in your business processes. Get a clear understanding of automation opportunities and priorities.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 33,
      isPriceStartingFrom: false,
      duration: 30,
      status: 'published',
      slug: 'express-ai-consultation-en',
      requiresBooking: true,
      requiresPayment: true,
    },
    {
      title: 'Standard AI Consultation',
      serviceType: 'consultation',
      shortDescription:
        'In-depth 90-minute analysis with detailed implementation plan and ROI calculations',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Comprehensive consultation with deep business process analysis, detailed AI implementation plan and accurate efficiency calculations.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 89,
      isPriceStartingFrom: false,
      duration: 90,
      status: 'published',
      slug: 'standard-ai-consultation-en',
      requiresBooking: true,
      requiresPayment: true,
    },
    {
      title: 'Premium AI Consultation',
      serviceType: 'consultation',
      shortDescription:
        'VIP 3-hour session with expert, including strategy, technical specifications and implementation plan',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Exclusive consultation with top AI expert. Complete implementation strategy, ready technical specifications and step-by-step implementation plan.',
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 278,
      isPriceStartingFrom: false,
      duration: 180,
      status: 'published',
      slug: 'premium-ai-consultation-en',
      requiresBooking: true,
      requiresPayment: true,
    },
  ]

  for (const serviceData of englishServices) {
    try {
      const service = await payload.create({
        collection: 'services',
        data: serviceData,
        locale: 'en',
      })
      console.log(`✅ Created English service: ${service.title} (${service.id})`)
    } catch (error) {
      console.error(`❌ Error creating English service "${serviceData.title}":`, error)
    }
  }
}

async function createCompleteServices() {
  console.log('🚀 Creating complete AI Agency services for both locales...')

  try {
    const payload = await getPayloadClient()
    console.log('✅ Payload client initialized')

    // Создаем русские услуги
    await createRussianServices(payload)

    // Создаем английские услуги
    await createEnglishServices(payload)

    console.log('🎉 Complete services creation finished!')
  } catch (error) {
    console.error('❌ Error:', error)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Запускаем скрипт
createCompleteServices()
