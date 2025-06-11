#!/usr/bin/env node

/**
 * Скрипт для проверки версий записей services
 * Анализирует, есть ли проблемы с версиями у старых записей
 */

import { getPayload } from 'payload'
import configPromise from '../../src/payload.config.ts'

async function checkServicesVersions() {
  console.log('🔍 Проверка версий записей services...\n')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✅ Payload инициализирован\n')

    // 1. Получаем все записи services
    console.log('📋 1. Анализ всех записей services:')
    const allServices = await payload.find({
      collection: 'services',
      limit: 100,
    })

    console.log(`   Всего записей: ${allServices.totalDocs}`)

    // 2. Анализируем каждую запись на предмет версий
    console.log('\n🔧 2. Детальный анализ записей:')
    
    let recordsWithVersions = 0
    let recordsWithoutVersions = 0
    let recordsWithProblems = []

    for (const service of allServices.docs) {
      console.log(`\n   📄 ${service.title} (ID: ${service.id})`)
      console.log(`      Status: ${service.status}`)
      console.log(`      _status: ${service._status}`)
      console.log(`      Created: ${service.createdAt}`)
      console.log(`      Updated: ${service.updatedAt}`)
      console.log(`      Published: ${service.publishedAt || 'не установлено'}`)

      // Проверяем наличие версий
      try {
        const versions = await payload.findVersions({
          collection: 'services',
          where: {
            parent: {
              equals: service.id,
            },
          },
          limit: 10,
        })

        console.log(`      Версий: ${versions.totalDocs}`)
        
        if (versions.totalDocs > 0) {
          recordsWithVersions++
          versions.docs.forEach((version, index) => {
            console.log(`        ${index + 1}. Version ${version.version} (${version.status || 'no status'}) - ${version.createdAt}`)
          })
        } else {
          recordsWithoutVersions++
          recordsWithProblems.push({
            id: service.id,
            title: service.title,
            issue: 'Нет версий'
          })
        }

      } catch (error) {
        console.log(`      ❌ Ошибка при получении версий: ${error.message}`)
        recordsWithProblems.push({
          id: service.id,
          title: service.title,
          issue: `Ошибка версий: ${error.message}`
        })
      }

      // Проверяем, можно ли получить запись как черновик
      try {
        const draftVersion = await payload.findByID({
          collection: 'services',
          id: service.id,
          draft: true,
        })
        console.log(`      Draft доступен: Да (Status: ${draftVersion.status})`)
      } catch (error) {
        console.log(`      Draft доступен: Нет (${error.message})`)
      }
    }

    // 3. Проверяем админ панель API
    console.log('\n🌐 3. Проверка админ панели API:')
    
    try {
      // Эмулируем запрос админ панели
      const adminResponse = await payload.find({
        collection: 'services',
        limit: 100,
        // Параметры, которые может использовать админ панель
      })
      
      console.log(`   Админ API возвращает: ${adminResponse.totalDocs} записей`)
      
      // Проверяем с draft: true
      const adminDraftResponse = await payload.find({
        collection: 'services',
        draft: true,
        limit: 100,
      })
      
      console.log(`   Админ API (с черновиками): ${adminDraftResponse.totalDocs} записей`)
      
    } catch (error) {
      console.log(`   ❌ Ошибка админ API: ${error.message}`)
    }

    // 4. Итоговая статистика
    console.log('\n📊 4. Итоговая статистика:')
    console.log(`   Записей с версиями: ${recordsWithVersions}`)
    console.log(`   Записей без версий: ${recordsWithoutVersions}`)
    console.log(`   Записей с проблемами: ${recordsWithProblems.length}`)

    if (recordsWithProblems.length > 0) {
      console.log('\n❗ Проблемные записи:')
      recordsWithProblems.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.title} (${record.id}): ${record.issue}`)
      })
    }

    // 5. Рекомендации
    console.log('\n💡 5. Рекомендации:')
    
    if (recordsWithoutVersions > 0) {
      console.log('   ⚠️  Найдены записи без версий - это может быть причиной проблем в админ панели')
      console.log('   🔧 Рекомендуется создать версии для этих записей')
    } else {
      console.log('   ✅ Все записи имеют версии')
    }

    console.log('\n✅ Анализ завершен!')
    
  } catch (error) {
    console.error('❌ Ошибка при анализе:', error)
    process.exit(1)
  }
}

// Запускаем анализ
checkServicesVersions()
  .then(() => {
    console.log('\n🎉 Анализ успешно завершен')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
