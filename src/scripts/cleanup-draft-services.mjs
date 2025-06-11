#!/usr/bin/env node

/**
 * Скрипт для очистки тестовых черновиков в коллекции services
 */

import { getPayload } from 'payload'
import configPromise from '../../src/payload.config.ts'

async function cleanupDraftServices() {
  console.log('🧹 Очистка тестовых черновиков в коллекции services...\n')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✅ Payload инициализирован\n')

    // Находим все черновики
    const draftServices = await payload.find({
      collection: 'services',
      where: {
        status: {
          equals: 'draft',
        },
      },
      limit: 100,
    })

    console.log(`📋 Найдено ${draftServices.totalDocs} черновиков:`)
    
    let deletedCount = 0
    
    for (const service of draftServices.docs) {
      console.log(`   - ${service.title} (ID: ${service.id})`)
      
      // Удаляем тестовые записи (например, с названием "ывыфвы" или другими тестовыми названиями)
      if (
        service.title === 'ывыфвы' ||
        service.title === 'test' ||
        service.title === 'Test' ||
        service.title === 'тест' ||
        service.title === 'Тест' ||
        service.title.includes('test') ||
        service.title.includes('Test')
      ) {
        try {
          await payload.delete({
            collection: 'services',
            id: service.id,
          })
          console.log(`   ✅ Удален: ${service.title}`)
          deletedCount++
        } catch (error) {
          console.log(`   ❌ Ошибка при удалении ${service.title}: ${error.message}`)
        }
      } else {
        console.log(`   ⏭️  Пропущен: ${service.title} (не тестовая запись)`)
      }
    }

    console.log(`\n📊 Результат:`)
    console.log(`   Удалено записей: ${deletedCount}`)
    console.log(`   Оставлено записей: ${draftServices.totalDocs - deletedCount}`)

    // Проверяем итоговое состояние
    const finalCheck = await payload.find({
      collection: 'services',
      limit: 0, // Только count
    })

    console.log(`\n🔍 Итоговое состояние коллекции:`)
    console.log(`   Всего записей: ${finalCheck.totalDocs}`)

    const publishedCheck = await payload.find({
      collection: 'services',
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 0,
    })

    console.log(`   Опубликованных: ${publishedCheck.totalDocs}`)

    const draftCheck = await payload.find({
      collection: 'services',
      where: {
        status: {
          equals: 'draft',
        },
      },
      limit: 0,
    })

    console.log(`   Черновиков: ${draftCheck.totalDocs}`)

    console.log('\n✅ Очистка завершена!')
    
  } catch (error) {
    console.error('❌ Ошибка при очистке:', error)
    process.exit(1)
  }
}

// Запускаем очистку
cleanupDraftServices()
  .then(() => {
    console.log('\n🎉 Очистка успешно завершена')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
