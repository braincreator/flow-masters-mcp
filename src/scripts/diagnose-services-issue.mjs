#!/usr/bin/env node

/**
 * Скрипт для диагностики проблемы с коллекцией services
 * Проверяет различия между данными в админ панели и фронтенде
 */

import { getPayload } from 'payload'
import configPromise from '../../src/payload.config.ts'

async function diagnoseServicesIssue() {
  console.log('🔍 Диагностика проблемы с коллекцией services...\n')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✅ Payload инициализирован\n')

    // 1. Проверяем общее количество записей в коллекции
    console.log('📊 1. Общая статистика коллекции services:')

    const allServices = await payload.find({
      collection: 'services',
      limit: 0, // Получаем только count
    })
    console.log(`   Всего записей: ${allServices.totalDocs}`)

    // 2. Проверяем опубликованные записи
    console.log('\n📋 2. Опубликованные записи (status: published):')
    const publishedServices = await payload.find({
      collection: 'services',
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 10,
    })
    console.log(`   Количество: ${publishedServices.totalDocs}`)
    publishedServices.docs.forEach((service, index) => {
      console.log(
        `   ${index + 1}. ${service.title} (ID: ${service.id}, Status: ${service.status})`,
      )
    })

    // 3. Проверяем черновики
    console.log('\n📝 3. Черновики (status: draft):')
    const draftServices = await payload.find({
      collection: 'services',
      where: {
        status: {
          equals: 'draft',
        },
      },
      limit: 10,
    })
    console.log(`   Количество: ${draftServices.totalDocs}`)
    draftServices.docs.forEach((service, index) => {
      console.log(
        `   ${index + 1}. ${service.title} (ID: ${service.id}, Status: ${service.status})`,
      )
    })

    // 4. Проверяем записи с версиями (drafts)
    console.log('\n🔄 4. Проверка версий и черновиков:')
    try {
      const servicesWithDrafts = await payload.find({
        collection: 'services',
        draft: true,
        limit: 10,
      })
      console.log(`   Записей с черновиками: ${servicesWithDrafts.totalDocs}`)
      servicesWithDrafts.docs.forEach((service, index) => {
        console.log(
          `   ${index + 1}. ${service.title} (ID: ${service.id}, Status: ${service.status}, Draft: ${service._status === 'draft' ? 'Yes' : 'No'})`,
        )
      })
    } catch (error) {
      console.log(`   ❌ Ошибка при получении черновиков: ${error.message}`)
    }

    // 5. Проверяем записи без статуса
    console.log('\n❓ 5. Записи без статуса или с некорректным статусом:')
    const servicesWithoutStatus = await payload.find({
      collection: 'services',
      where: {
        or: [
          {
            status: {
              exists: false,
            },
          },
          {
            status: {
              not_in: ['published', 'draft', 'archived'],
            },
          },
        ],
      },
      limit: 10,
    })
    console.log(`   Количество: ${servicesWithoutStatus.totalDocs}`)
    servicesWithoutStatus.docs.forEach((service, index) => {
      console.log(
        `   ${index + 1}. ${service.title} (ID: ${service.id}, Status: ${service.status || 'undefined'})`,
      )
    })

    // 6. Тестируем API endpoints
    console.log('\n🌐 6. Тестирование API endpoints:')

    // Тест обычного API (только published)
    try {
      const response = await fetch('http://localhost:3000/api/v1/services?status=published&limit=5')
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ Frontend API (published): ${data.docs?.length || 0} записей`)
      } else {
        console.log(`   ❌ Frontend API error: ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ Frontend API недоступен: ${error.message}`)
    }

    // Тест API с черновиками
    try {
      const response = await fetch(
        'http://localhost:3000/api/v1/services?includeDrafts=true&limit=5',
      )
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ Frontend API (с черновиками): ${data.docs?.length || 0} записей`)
      } else {
        console.log(`   ❌ Frontend API (с черновиками) error: ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ Frontend API (с черновиками) недоступен: ${error.message}`)
    }

    // 7. Проверяем структуру данных
    console.log('\n🔧 7. Анализ структуры данных:')
    if (allServices.docs.length > 0) {
      const sampleService = allServices.docs[0]
      console.log('   Пример структуры записи:')
      console.log(`   - ID: ${sampleService.id}`)
      console.log(`   - Title: ${sampleService.title}`)
      console.log(`   - Status: ${sampleService.status}`)
      console.log(`   - _status: ${sampleService._status || 'undefined'}`)
      console.log(`   - createdAt: ${sampleService.createdAt}`)
      console.log(`   - updatedAt: ${sampleService.updatedAt}`)
      console.log(`   - publishedAt: ${sampleService.publishedAt || 'undefined'}`)

      // Проверяем наличие версий
      if (sampleService.versions) {
        console.log(`   - Versions: ${sampleService.versions.length || 0} версий`)
      }
    }

    console.log('\n✅ Диагностика завершена!')
  } catch (error) {
    console.error('❌ Ошибка при диагностике:', error)
    process.exit(1)
  }
}

// Запускаем диагностику
diagnoseServicesIssue()
  .then(() => {
    console.log('\n🎉 Диагностика успешно завершена')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
