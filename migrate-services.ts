/**
 * Миграция услуг через Payload Local API
 */

import { getPayload } from 'payload'
import config from './src/payload.config'

// Данные услуг для миграции
const servicesData = [
  {
    title: {
      ru: "Экспресс-консультация по ИИ",
      en: "Express AI Consultation"
    },
    serviceType: "consultation",
    description: {
      ru: {
        root: {
          type: "root",
          children: [{
            type: "paragraph",
            version: 1,
            children: [{
              type: "text",
              version: 1,
              text: "За 30 минут определим наиболее перспективные направления для внедрения искусственного интеллекта в ваши бизнес-процессы. Получите четкое понимание возможностей и приоритетов автоматизации."
            }]
          }],
          direction: null,
          format: "",
          indent: 0,
          version: 1
        }
      },
      en: {
        root: {
          type: "root",
          children: [{
            type: "paragraph",
            version: 1,
            children: [{
              type: "text",
              version: 1,
              text: "In 30 minutes, we'll identify the most promising areas for implementing artificial intelligence in your business processes. Get a clear understanding of automation opportunities and priorities."
            }]
          }],
          direction: null,
          format: "",
          indent: 0,
          version: 1
        }
      }
    },
    shortDescription: {
      ru: "Быстрая 30-минутная оценка потенциала ИИ с выявлением приоритетных точек автоматизации",
      en: "Quick 30-minute AI potential assessment with identification of priority automation points"
    },
    price: {
      ru: 3000,
      en: 33
    },
    isPriceStartingFrom: false,
    duration: 30,
    status: "published",
    slug: "express-ai-consultation"
  },
  {
    title: {
      ru: "Стандартная консультация по ИИ",
      en: "Standard AI Consultation"
    },
    serviceType: "consultation",
    shortDescription: {
      ru: "Углубленный 90-минутный анализ с детальным планом внедрения и ROI-расчетами",
      en: "In-depth 90-minute analysis with detailed implementation plan and ROI calculations"
    },
    price: {
      ru: 8000,
      en: 89
    },
    status: "published",
    slug: "standard-ai-consultation"
  },
  {
    title: {
      ru: "Премиум консультация по ИИ",
      en: "Premium AI Consultation"
    },
    serviceType: "consultation",
    shortDescription: {
      ru: "VIP-сессия 3 часа с экспертом, включая стратегию, техзадание и план реализации",
      en: "VIP 3-hour session with expert, including strategy, technical specification and implementation plan"
    },
    price: {
      ru: 25000,
      en: 278
    },
    status: "published",
    slug: "premium-ai-consultation"
  },
  {
    title: {
      ru: "Базовый ИИ-чатбот",
      en: "Basic AI Chatbot"
    },
    serviceType: "development",
    shortDescription: {
      ru: "Простой чат-бот для одной платформы с базовым ИИ и готовыми сценариями",
      en: "Simple chatbot for one platform with basic AI and ready-made scenarios"
    },
    price: {
      ru: 25000,
      en: 278
    },
    status: "published",
    slug: "basic-ai-chatbot"
  },
  {
    title: {
      ru: "Стандартный ИИ-чатбот",
      en: "Standard AI Chatbot"
    },
    serviceType: "development",
    shortDescription: {
      ru: "Продвинутый чат-бот с интеграциями, аналитикой и мультиплатформенностью",
      en: "Advanced chatbot with integrations, analytics and multi-platform support"
    },
    price: {
      ru: 45000,
      en: 500
    },
    status: "published",
    slug: "standard-ai-chatbot"
  },
  {
    title: {
      ru: "Премиум ИИ-чатбот",
      en: "Premium AI Chatbot"
    },
    serviceType: "development",
    shortDescription: {
      ru: "Корпоративное решение с полной автоматизацией и интеграцией систем",
      en: "Enterprise solution with full automation and system integration"
    },
    price: {
      ru: 85000,
      en: 944
    },
    status: "published",
    slug: "premium-ai-chatbot"
  },
  {
    title: {
      ru: "ИИ-агенты под ключ",
      en: "AI Agents Turnkey"
    },
    serviceType: "automation",
    shortDescription: {
      ru: "Автономные ИИ-агенты для полной автоматизации сложных бизнес-процессов",
      en: "Autonomous AI agents for complete automation of complex business processes"
    },
    price: {
      ru: 120000,
      en: 1333
    },
    isPriceStartingFrom: true,
    status: "published",
    slug: "ai-agents-turnkey"
  },
  {
    title: {
      ru: "Интеграция ИИ в процессы",
      en: "AI Integration into Processes"
    },
    serviceType: "automation",
    shortDescription: {
      ru: "Полная интеграция ИИ-решений в существующие бизнес-процессы компании",
      en: "Complete integration of AI solutions into existing company business processes"
    },
    price: {
      ru: 80000,
      en: 889
    },
    isPriceStartingFrom: true,
    status: "published",
    slug: "ai-integration"
  },
  {
    title: {
      ru: "Автоворонки и персонализация",
      en: "AI Sales Funnels & Personalization"
    },
    serviceType: "automation",
    shortDescription: {
      ru: "Умные продажные воронки с ИИ-персонализацией и автоматической оптимизацией",
      en: "Smart sales funnels with AI personalization and automatic optimization"
    },
    price: {
      ru: 95000,
      en: 1056
    },
    isPriceStartingFrom: true,
    status: "published",
    slug: "ai-sales-funnels"
  }
]

async function migrateServices() {
  console.log('🚀 Начинаем миграцию услуг через Payload Local API...')
  
  try {
    // Инициализируем Payload
    const payload = await getPayload({ config })
    console.log('✅ Payload инициализирован')
    
    // Очищаем коллекцию
    const existingServices = await payload.find({
      collection: 'services',
      limit: 1000
    })
    
    if (existingServices.totalDocs > 0) {
      console.log(`🧹 Удаляем ${existingServices.totalDocs} существующих записей...`)
      for (const service of existingServices.docs) {
        await payload.delete({
          collection: 'services',
          id: service.id
        })
      }
    }
    
    // Создаем новые записи
    console.log(`📝 Создаем ${servicesData.length} новых услуг...`)
    
    for (let i = 0; i < servicesData.length; i++) {
      const serviceData = servicesData[i]
      
      try {
        const result = await payload.create({
          collection: 'services',
          data: {
            ...serviceData,
            _status: 'published'
          }
        })
        
        console.log(`✅ Создана услуга ${i + 1}: ${result.title.ru}`)
        
      } catch (error) {
        console.error(`❌ Ошибка создания услуги ${i + 1}:`, error.message)
      }
    }
    
    // Проверяем результат
    const finalCount = await payload.find({
      collection: 'services',
      limit: 1
    })
    
    console.log(`\n🎯 Миграция завершена!`)
    console.log(`📊 Всего услуг в коллекции: ${finalCount.totalDocs}`)
    console.log(`🌐 Проверьте результат: http://localhost:3000/admin/collections/services`)
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error)
  }
}

// Запускаем миграцию
migrateServices().catch(console.error)
