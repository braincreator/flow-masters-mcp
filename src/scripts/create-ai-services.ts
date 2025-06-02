#!/usr/bin/env tsx

/**
 * Script to create AI Agency services for testing
 * Run with: npx tsx src/scripts/create-ai-services.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

const aiServices = [
  {
    title: 'ИИ-агенты под ключ',
    serviceType: 'automation',
    shortDescription: 'Умные помощники для автоматизации бизнес-процессов',
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
                text: 'Создаем персональных ИИ-агентов для автоматизации рутинных задач в вашем бизнесе.'
              }
            ]
          }
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1
      }
    },
    price: 150000,
    isPriceStartingFrom: true,
    duration: 2160, // 36 часов = 3-6 недель
    status: 'published',
    slug: 'ai-agents-turnkey'
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
                text: 'Разрабатываем умных чат-ботов с интеграцией нейросетей для всех популярных платформ.'
              }
            ]
          }
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1
      }
    },
    price: 80000,
    isPriceStartingFrom: true,
    duration: 1440, // 24 часа = 2-3 недели
    status: 'published',
    slug: 'ai-chatbots'
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
                text: 'Интегрируем ИИ-решения в ваши существующие бизнес-процессы и системы.'
              }
            ]
          }
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1
      }
    },
    price: 200000,
    isPriceStartingFrom: true,
    duration: 2880, // 48 часов = 4-8 недель
    status: 'published',
    slug: 'ai-integration'
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
                text: 'Бесплатный аудит ваших бизнес-процессов для выявления точек применения ИИ.'
              }
            ]
          }
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1
      }
    },
    price: 0,
    isPriceStartingFrom: false,
    duration: 480, // 8 часов = 3-7 дней
    status: 'published',
    slug: 'ai-audit-free'
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
                text: 'Создаем автоматизированные воронки продаж с ИИ-персонализацией.'
              }
            ]
          }
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1
      }
    },
    price: 120000,
    isPriceStartingFrom: true,
    duration: 960, // 16 часов = 10-14 дней
    status: 'published',
    slug: 'ai-sales-funnels'
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
                text: 'Индивидуальные консультации по стратегии внедрения ИИ в ваш бизнес.'
              }
            ]
          }
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1
      }
    },
    price: 15000,
    isPriceStartingFrom: false,
    duration: 60, // 1 час
    status: 'published',
    slug: 'ai-consultation'
  }
]

async function createAIServices() {
  console.log('🤖 Creating AI Agency services...')
  
  try {
    const payload = await getPayloadClient()
    console.log('✅ Payload client initialized')

    for (const serviceData of aiServices) {
      try {
        // Проверяем, существует ли уже услуга с таким slug
        const existing = await payload.find({
          collection: 'services',
          where: {
            slug: {
              equals: serviceData.slug
            }
          },
          limit: 1
        })

        if (existing.docs.length > 0) {
          console.log(`⚠️  Service "${serviceData.title}" already exists, skipping...`)
          continue
        }

        // Создаем услугу
        const service = await payload.create({
          collection: 'services',
          data: serviceData
        })

        console.log(`✅ Created service: ${service.title} (${service.id})`)
      } catch (error) {
        console.error(`❌ Error creating service "${serviceData.title}":`, error)
      }
    }

    console.log('🎉 AI Agency services creation completed!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Запускаем скрипт
createAIServices()
