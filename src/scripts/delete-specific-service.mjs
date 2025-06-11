#!/usr/bin/env node

/**
 * Скрипт для удаления конкретной записи services
 */

import { getPayload } from 'payload'
import configPromise from '../../src/payload.config.ts'

async function deleteSpecificService() {
  console.log('🗑️  Удаление конкретной записи services...\n')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✅ Payload инициализирован\n')

    const serviceId = '684367906fd0cdafe0d5a57e'
    
    console.log(`🔍 Поиск записи с ID: ${serviceId}`)
    
    // Сначала попробуем найти запись
    try {
      const service = await payload.findByID({
        collection: 'services',
        id: serviceId,
      })
      
      console.log(`📋 Найдена запись: ${service.title} (Status: ${service.status})`)
      
      // Удаляем запись
      await payload.delete({
        collection: 'services',
        id: serviceId,
      })
      
      console.log(`✅ Запись успешно удалена`)
      
    } catch (error) {
      console.log(`❌ Запись не найдена или ошибка: ${error.message}`)
      
      // Попробуем найти с draft: true
      try {
        console.log(`🔍 Поиск черновика...`)
        const draftService = await payload.findByID({
          collection: 'services',
          id: serviceId,
          draft: true,
        })
        
        console.log(`📋 Найден черновик: ${draftService.title} (Status: ${draftService.status})`)
        
        // Удаляем черновик
        await payload.delete({
          collection: 'services',
          id: serviceId,
        })
        
        console.log(`✅ Черновик успешно удален`)
        
      } catch (draftError) {
        console.log(`❌ Черновик не найден: ${draftError.message}`)
      }
    }

    // Проверяем итоговое состояние
    const finalCheck = await payload.find({
      collection: 'services',
      limit: 0,
    })

    console.log(`\n🔍 Итоговое состояние:`)
    console.log(`   Всего записей: ${finalCheck.totalDocs}`)

    // Проверяем черновики
    try {
      const draftsCheck = await payload.find({
        collection: 'services',
        draft: true,
        limit: 10,
      })
      
      console.log(`   Записей с черновиками: ${draftsCheck.totalDocs}`)
      
      if (draftsCheck.totalDocs > 0) {
        draftsCheck.docs.forEach((service, index) => {
          console.log(`   ${index + 1}. ${service.title} (ID: ${service.id}, Status: ${service.status})`)
        })
      }
    } catch (error) {
      console.log(`   Ошибка при проверке черновиков: ${error.message}`)
    }

    console.log('\n✅ Операция завершена!')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

// Запускаем удаление
deleteSpecificService()
  .then(() => {
    console.log('\n🎉 Операция успешно завершена')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
