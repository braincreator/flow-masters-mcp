#!/usr/bin/env tsx

/**
 * Script to create complete AI Agency services for both locales
 * Run with: npx tsx src/scripts/create-ai-services.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Русские услуги - консультации (3 уровня)
const russianConsultationServices = [
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
            type: 'heading',
            version: 1,
            tag: 'h2',
            children: [
              { type: 'text', version: 1, text: 'Быстрая оценка потенциала ИИ для вашего бизнеса' },
            ],
          },
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
          {
            type: 'heading',
            version: 1,
            tag: 'h3',
            children: [{ type: 'text', version: 1, text: 'Что входит в консультацию:' }],
          },
          {
            type: 'list',
            version: 1,
            listType: 'bullet',
            start: 1,
            children: [
              {
                type: 'listitem',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: 'Экспресс-анализ 2-3 ключевых бизнес-процессов',
                  },
                ],
              },
              {
                type: 'listitem',
                version: 1,
                children: [
                  { type: 'text', version: 1, text: 'Определение приоритетных направлений для ИИ' },
                ],
              },
              {
                type: 'listitem',
                version: 1,
                children: [
                  { type: 'text', version: 1, text: 'Предварительная оценка ROI от автоматизации' },
                ],
              },
              {
                type: 'listitem',
                version: 1,
                children: [
                  { type: 'text', version: 1, text: 'Рекомендации по подходящим ИИ-инструментам' },
                ],
              },
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Идеально подходит для первого знакомства с возможностями ИИ и быстрого определения точек роста.',
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
    features: [
      {
        name: 'Экспресс-анализ процессов',
        description: 'Быстрая оценка 2-3 ключевых бизнес-процессов на предмет автоматизации',
        included: true,
      },
      {
        name: 'Приоритизация возможностей',
        description: 'Определение наиболее перспективных направлений для внедрения ИИ',
        included: true,
      },
      {
        name: 'Предварительная оценка ROI',
        description: 'Ориентировочный расчет эффекта от автоматизации',
        included: true,
      },
      {
        name: 'Рекомендации по инструментам',
        description: 'Краткий обзор подходящих ИИ-решений',
        included: true,
      },
    ],
    requiresBooking: true,
    bookingSettings: {
      provider: 'calendly',
      calendlyUsername: 'flow-masters',
      calendlyEventType: 'express-consulting',
      hideEventTypeDetails: true,
      hideGdprBanner: true,
      enableAdditionalInfo: false,
      additionalInfoFields: [],
      additionalInfoRequired: false,
    },
    requiresPayment: true,
    paymentSettings: {
      paymentType: 'full_prepayment',
      prepaymentPercentage: 100,
    },
    status: 'published',
    publishedAt: new Date().toISOString(),
    meta: {
      title: 'Экспресс-консультация по ИИ | Быстрая оценка потенциала автоматизации',
      description:
        'Быстрая 30-минутная консультация по возможностям ИИ. Выявление приоритетных точек автоматизации, предварительная оценка ROI, рекомендации по инструментам.',
    },
    slug: 'express-ai-consultation',
  },
  {
    title: 'Чат-боты с нейросетями',
    serviceType: 'development',
    shortDescription: 'Telegram, WhatsApp, Web - везде, где ваши клиенты',
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
                text: 'Разрабатываем умных чат-ботов с интеграцией нейросетей для всех популярных платформ.',
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
    price: 80000,
    isPriceStartingFrom: true,
    duration: 1440, // 24 часа = 2-3 недели
    status: 'published',
    slug: 'ai-chatbots',
  },
  {
    title: 'Интеграция ИИ в процессы',
    serviceType: 'integration',
    shortDescription: 'Консалтинг и внедрение в существующие системы',
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
                text: 'Интегрируем ИИ-решения в ваши существующие бизнес-процессы и системы.',
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
    price: 200000,
    isPriceStartingFrom: true,
    duration: 2880, // 48 часов = 4-8 недель
    status: 'published',
    slug: 'ai-integration',
  },
  {
    title: 'Аудит и поиск точек для ИИ',
    serviceType: 'audit',
    shortDescription: 'Находим, где ИИ принесет максимальную выгоду',
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
                text: 'Бесплатный аудит ваших бизнес-процессов для выявления точек применения ИИ.',
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
    price: 0,
    isPriceStartingFrom: false,
    duration: 480, // 8 часов = 3-7 дней
    status: 'published',
    slug: 'ai-audit-free',
  },
  {
    title: 'Автоворонки и персонализация',
    serviceType: 'automation',
    shortDescription: 'Умные воронки продаж и персональные рекомендации',
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
                text: 'Создаем автоматизированные воронки продаж с ИИ-персонализацией.',
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
    price: 120000,
    isPriceStartingFrom: true,
    duration: 960, // 16 часов = 10-14 дней
    status: 'published',
    slug: 'ai-sales-funnels',
  },
  {
    title: 'ИИ-консультации',
    serviceType: 'consultation',
    shortDescription: 'Персональные консультации по внедрению ИИ',
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
                text: 'Индивидуальные консультации по стратегии внедрения ИИ в ваш бизнес.',
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
    price: 15000,
    isPriceStartingFrom: false,
    duration: 60, // 1 час
    status: 'published',
    slug: 'ai-consultation',
  },
]

async function createAIServices() {
  logDebug('🤖 Creating AI Agency services...')

  try {
    const payload = await getPayloadClient()
    logDebug('✅ Payload client initialized')

    for (const serviceData of aiServices) {
      try {
        // Проверяем, существует ли уже услуга с таким slug
        const existing = await payload.find({
          collection: 'services',
          where: {
            slug: {
              equals: serviceData.slug,
            },
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          console.log(`⚠️  Service "${serviceData.title}" already exists, skipping...`)
          continue
        }

        // Создаем услугу
        const service = await payload.create({
          collection: 'services',
          data: serviceData,
        })

        logDebug(`✅ Created service: ${service.title} (${service.id})`)
      } catch (error) {
        logError(`❌ Error creating service "${serviceData.title}":`, error)
      }
    }

    logDebug('🎉 AI Agency services creation completed!')
  } catch (error) {
    logError('❌ Error:', error)
    process.exit(1)
  }
}

// Запускаем скрипт
createAIServices()
