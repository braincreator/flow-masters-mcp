#!/usr/bin/env node

/**
 * Скрипт для автоматического добавления SEO метаданных к услугам
 */

const { MongoClient } = require('mongodb')

// SEO метаданные для каждой услуги
const seoMetadata = {
  // Консультации
  'standard-ai-consultation': {
    title: {
      ru: 'Стандартная консультация по ИИ | Углубленный анализ и план внедрения',
      en: 'Standard AI Consultation | In-depth Analysis and Implementation Plan'
    },
    description: {
      ru: 'Углубленная 90-минутная консультация по внедрению ИИ с детальным планом, ROI-расчетами и персональными рекомендациями для вашего бизнеса.',
      en: 'In-depth 90-minute AI implementation consultation with detailed plan, ROI calculations and personalized recommendations for your business.'
    }
  },
  'premium-ai-consultation': {
    title: {
      ru: 'Премиум консультация по ИИ | VIP-сессия с экспертом 3 часа',
      en: 'Premium AI Consultation | VIP Expert Session 3 Hours'
    },
    description: {
      ru: 'VIP-сессия 3 часа с экспертом по ИИ. Включает стратегию внедрения, техническое задание и детальный план реализации для вашего проекта.',
      en: 'VIP 3-hour session with AI expert. Includes implementation strategy, technical specifications and detailed realization plan for your project.'
    }
  },

  // Разработка чатботов
  'basic-ai-chatbot': {
    title: {
      ru: 'Базовый ИИ-чатбот | Простое решение для автоматизации',
      en: 'Basic AI Chatbot | Simple Automation Solution'
    },
    description: {
      ru: 'Простой ИИ-чатбот для одной платформы с базовым искусственным интеллектом и готовыми сценариями общения. Быстрый старт автоматизации.',
      en: 'Simple AI chatbot for one platform with basic artificial intelligence and ready-made conversation scenarios. Quick automation start.'
    }
  },
  'standard-ai-chatbot': {
    title: {
      ru: 'Стандартный ИИ-чатбот | Продвинутое решение с интеграциями',
      en: 'Standard AI Chatbot | Advanced Solution with Integrations'
    },
    description: {
      ru: 'Продвинутый чат-бот с интеграциями, аналитикой и мультиплатформенностью. Умная автоматизация клиентского сервиса для растущего бизнеса.',
      en: 'Advanced chatbot with integrations, analytics and multi-platform support. Smart customer service automation for growing business.'
    }
  },
  'premium-ai-chatbot': {
    title: {
      ru: 'Премиум ИИ-чатбот | Корпоративное решение под ключ',
      en: 'Premium AI Chatbot | Enterprise Turnkey Solution'
    },
    description: {
      ru: 'Корпоративное решение с полной автоматизацией и интеграцией систем. Максимальная функциональность для крупного бизнеса и сложных процессов.',
      en: 'Enterprise solution with full automation and system integration. Maximum functionality for large business and complex processes.'
    }
  },

  // Автоматизация
  'ai-agents-turnkey': {
    title: {
      ru: 'ИИ-агенты под ключ | Автономная автоматизация процессов',
      en: 'AI Agents Turnkey | Autonomous Process Automation'
    },
    description: {
      ru: 'Автономные ИИ-агенты для полной автоматизации сложных бизнес-процессов. Самообучающиеся системы нового поколения для вашего бизнеса.',
      en: 'Autonomous AI agents for complete automation of complex business processes. Next-generation self-learning systems for your business.'
    }
  },
  'ai-integration': {
    title: {
      ru: 'Интеграция ИИ в процессы | Полная автоматизация бизнеса',
      en: 'AI Integration in Processes | Complete Business Automation'
    },
    description: {
      ru: 'Полная интеграция ИИ-решений в существующие бизнес-процессы компании. Бесшовное внедрение искусственного интеллекта в вашу экосистему.',
      en: 'Complete integration of AI solutions into existing company business processes. Seamless implementation of artificial intelligence into your ecosystem.'
    }
  },
  'ai-sales-funnels': {
    title: {
      ru: 'Автоворонки и персонализация | Умные продажные воронки с ИИ',
      en: 'Auto-funnels and Personalization | Smart AI Sales Funnels'
    },
    description: {
      ru: 'Умные продажные воронки с ИИ-персонализацией и автоматической оптимизацией. Увеличьте конверсию с помощью искусственного интеллекта.',
      en: 'Smart sales funnels with AI personalization and automatic optimization. Increase conversion with artificial intelligence.'
    }
  }
}

async function addSeoMeta() {
  console.log('🔧 Добавление SEO метаданных к услугам...\n')

  const client = new MongoClient('mongodb://127.0.0.1:27017/flow-masters')

  try {
    await client.connect()
    console.log('✅ Подключение к MongoDB установлено\n')

    const db = client.db('flow-masters')
    const servicesCollection = db.collection('services')

    // 1. Получаем все услуги без метаданных
    console.log('📊 1. Поиск услуг без SEO метаданных:')
    
    const servicesWithoutMeta = await servicesCollection.find({
      $or: [
        { 'meta.title': { $exists: false } },
        { 'meta.title': null },
        { 'meta.title': '' },
        { 'meta.description': { $exists: false } },
        { 'meta.description': null },
        { 'meta.description': '' }
      ]
    }).toArray()

    console.log(`   Найдено ${servicesWithoutMeta.length} услуг без метаданных`)

    // 2. Добавляем метаданные
    console.log('\n🔧 2. Добавление SEO метаданных:')
    
    let updatedCount = 0
    let errorCount = 0

    for (const service of servicesWithoutMeta) {
      try {
        const title = typeof service.title === 'object' 
          ? (service.title.ru || service.title.en || 'Без названия')
          : service.title || 'Без названия'

        console.log(`   Обрабатываем: ${title}`)
        console.log(`   Slug: ${service.slug}`)

        // Ищем метаданные по slug
        const metaData = seoMetadata[service.slug]
        
        if (metaData) {
          // Обновляем запись с SEO метаданными
          const updateResult = await servicesCollection.updateOne(
            { _id: service._id },
            {
              $set: {
                'meta.title': metaData.title,
                'meta.description': metaData.description
              }
            }
          )

          if (updateResult.modifiedCount > 0) {
            console.log(`     ✅ Добавлены метаданные`)
            console.log(`     - Title (RU): ${metaData.title.ru.substring(0, 50)}...`)
            console.log(`     - Title (EN): ${metaData.title.en.substring(0, 50)}...`)
            updatedCount++
          } else {
            console.log(`     ⚠️ Не обновлено`)
          }
        } else {
          console.log(`     ⚠️ Метаданные не найдены для slug: ${service.slug}`)
          
          // Создаем базовые метаданные на основе существующих данных
          const shortDesc = typeof service.shortDescription === 'object'
            ? service.shortDescription
            : { ru: service.shortDescription || '', en: service.shortDescription || '' }

          const serviceTitle = typeof service.title === 'object'
            ? service.title
            : { ru: service.title || '', en: service.title || '' }

          const basicMeta = {
            title: {
              ru: `${serviceTitle.ru} | Flow Masters`,
              en: `${serviceTitle.en} | Flow Masters`
            },
            description: shortDesc
          }

          const updateResult = await servicesCollection.updateOne(
            { _id: service._id },
            {
              $set: {
                'meta.title': basicMeta.title,
                'meta.description': basicMeta.description
              }
            }
          )

          if (updateResult.modifiedCount > 0) {
            console.log(`     ✅ Добавлены базовые метаданные`)
            updatedCount++
          }
        }

      } catch (error) {
        console.log(`     ❌ Ошибка: ${error.message}`)
        errorCount++
      }
    }

    // 3. Результаты
    console.log('\n📊 3. Результаты:')
    console.log(`   ✅ Обновлено услуг: ${updatedCount}`)
    console.log(`   ❌ Ошибок: ${errorCount}`)

    // 4. Финальная проверка
    console.log('\n🔍 4. Финальная проверка:')
    
    const servicesWithMeta = await servicesCollection.countDocuments({
      'meta.title': { $exists: true, $ne: null, $ne: '' },
      'meta.description': { $exists: true, $ne: null, $ne: '' }
    })

    const totalServices = await servicesCollection.countDocuments()
    
    console.log(`   Услуг с метаданными: ${servicesWithMeta} из ${totalServices}`)
    
    if (servicesWithMeta === totalServices) {
      console.log('   ✅ Все услуги теперь имеют SEO метаданные!')
    } else {
      console.log(`   ⚠️ Еще ${totalServices - servicesWithMeta} услуг нуждаются в метаданных`)
    }

    // 5. Показываем примеры добавленных метаданных
    if (updatedCount > 0) {
      console.log('\n📋 5. Примеры добавленных метаданных:')
      
      const updatedServices = await servicesCollection.find({
        'meta.title': { $exists: true },
        'meta.description': { $exists: true }
      }).limit(3).toArray()

      updatedServices.forEach((service, index) => {
        const title = typeof service.title === 'object' 
          ? (service.title.ru || service.title.en)
          : service.title
        
        console.log(`   ${index + 1}. ${title}`)
        if (service.meta.title) {
          console.log(`      Meta Title (RU): ${service.meta.title.ru}`)
          console.log(`      Meta Title (EN): ${service.meta.title.en}`)
        }
        if (service.meta.description) {
          console.log(`      Meta Desc (RU): ${service.meta.description.ru.substring(0, 100)}...`)
          console.log(`      Meta Desc (EN): ${service.meta.description.en.substring(0, 100)}...`)
        }
        console.log('')
      })
    }

    console.log('\n✅ Добавление SEO метаданных завершено!')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

addSeoMeta()
