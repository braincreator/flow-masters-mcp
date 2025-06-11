#!/usr/bin/env node

/**
 * Скрипт для исправления видимости записей в админ панели
 * Проблема: записи не отображаются в админ панели из-за отсутствия поля versions
 */

const { MongoClient } = require('mongodb')

async function fixAdminPanelVisibility() {
  console.log('🔧 Исправление видимости записей в админ панели...\n')

  const client = new MongoClient('mongodb://127.0.0.1:27017/flow-masters')

  try {
    await client.connect()
    console.log('✅ Подключение к MongoDB установлено\n')

    const db = client.db('flow-masters')
    const servicesCollection = db.collection('services')

    // 1. Проверяем текущее состояние
    console.log('📊 1. Текущее состояние:')
    const totalServices = await servicesCollection.countDocuments()
    console.log(`   Всего записей: ${totalServices}`)

    const servicesWithoutVersions = await servicesCollection.countDocuments({
      $or: [
        { versions: { $exists: false } },
        { versions: null }
      ]
    })
    console.log(`   Записей без поля versions: ${servicesWithoutVersions}`)

    // 2. Исправляем записи
    console.log('\n🔧 2. Исправление записей:')
    
    let fixedCount = 0
    let errorCount = 0

    // Получаем все записи без поля versions
    const servicesToFix = await servicesCollection.find({
      $or: [
        { versions: { $exists: false } },
        { versions: null }
      ]
    }).toArray()

    console.log(`   Найдено ${servicesToFix.length} записей для исправления`)

    for (const service of servicesToFix) {
      try {
        const title = typeof service.title === 'object' 
          ? (service.title.ru || service.title.en || 'Без названия')
          : service.title || 'Без названия'

        console.log(`   Исправляем: ${title} (${service._id})`)

        // Добавляем поле versions как пустой массив
        // Это говорит Payload CMS, что запись поддерживает versions, но пока нет версий
        const updateResult = await servicesCollection.updateOne(
          { _id: service._id },
          { 
            $set: { 
              versions: [],
              // Убеждаемся, что _status установлен правильно
              _status: 'published'
            }
          }
        )

        if (updateResult.modifiedCount > 0) {
          console.log(`     ✅ Исправлено`)
          fixedCount++
        } else {
          console.log(`     ⚠️ Не изменено (возможно, уже исправлено)`)
        }

      } catch (error) {
        console.log(`     ❌ Ошибка: ${error.message}`)
        errorCount++
      }
    }

    // 3. Проверяем результат
    console.log('\n📊 3. Результат исправления:')
    console.log(`   Исправлено записей: ${fixedCount}`)
    console.log(`   Ошибок: ${errorCount}`)

    // Финальная проверка
    const finalServicesWithoutVersions = await servicesCollection.countDocuments({
      $or: [
        { versions: { $exists: false } },
        { versions: null }
      ]
    })
    console.log(`   Записей без versions после исправления: ${finalServicesWithoutVersions}`)

    // 4. Проверяем структуру исправленной записи
    console.log('\n🔍 4. Проверка исправленной записи:')
    const fixedService = await servicesCollection.findOne({ versions: { $exists: true } })
    if (fixedService) {
      const title = typeof fixedService.title === 'object' 
        ? (fixedService.title.ru || fixedService.title.en)
        : fixedService.title
      
      console.log(`   Пример исправленной записи: ${title}`)
      console.log(`   - _id: ${fixedService._id}`)
      console.log(`   - _status: ${fixedService._status}`)
      console.log(`   - businessStatus: ${fixedService.businessStatus}`)
      console.log(`   - versions: ${JSON.stringify(fixedService.versions)}`)
    }

    // 5. Тестируем админский API
    console.log('\n🔌 5. Тестирование админского API:')
    try {
      const response = await fetch('http://localhost:3000/api/services')
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ Админский API теперь возвращает: ${data.docs?.length || 0} записей`)
        
        if (data.docs && data.docs.length > 0) {
          console.log('   Первые 3 записи:')
          data.docs.slice(0, 3).forEach((doc, index) => {
            const title = typeof doc.title === 'object' 
              ? (doc.title.ru || doc.title.en)
              : doc.title
            console.log(`     ${index + 1}. ${title} (ID: ${doc.id})`)
          })
        }
      } else {
        console.log(`   ❌ Админский API ошибка: ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ Ошибка тестирования API: ${error.message}`)
    }

    console.log('\n✅ Исправление завершено!')
    
    if (fixedCount > 0) {
      console.log('\n🎉 Результат:')
      console.log('   - Записи теперь должны отображаться в админ панели')
      console.log('   - Поле versions добавлено ко всем записям')
      console.log('   - _status установлен как "published"')
      console.log('\n📋 Следующие шаги:')
      console.log('   1. Обновите страницу админ панели (F5)')
      console.log('   2. Очистите кэш браузера если нужно')
      console.log('   3. Проверьте, что записи отображаются')
    } else {
      console.log('\n⚠️ Записи уже были исправлены ранее')
    }

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

fixAdminPanelVisibility()
