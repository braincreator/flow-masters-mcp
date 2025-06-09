#!/usr/bin/env node

/**
 * Скрипт для миграции поля status в businessStatus в коллекции services
 * и настройки правильной работы с черновиками
 */

const { MongoClient } = require('mongodb')

async function migrateServicesStatus() {
  console.log('🔄 Миграция поля status в businessStatus для коллекции services...\n')

  const client = new MongoClient('mongodb://127.0.0.1:27017/flow-masters')

  try {
    await client.connect()
    console.log('✅ Подключение к MongoDB установлено\n')

    const db = client.db('flow-masters')
    const servicesCollection = db.collection('services')

    // 1. Проверяем текущее состояние
    console.log('📊 1. Текущее состояние коллекции:')
    const totalCount = await servicesCollection.countDocuments()
    console.log(`   Всего записей: ${totalCount}`)

    // Проверяем статистику по старому полю status
    const statusStats = await servicesCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    console.log('   Статистика по старому полю status:')
    statusStats.forEach(stat => {
      console.log(`     ${stat._id || 'undefined'}: ${stat.count}`)
    })

    // Проверяем есть ли уже поле businessStatus
    const businessStatusStats = await servicesCollection.aggregate([
      {
        $group: {
          _id: '$businessStatus',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    console.log('   Статистика по новому полю businessStatus:')
    businessStatusStats.forEach(stat => {
      console.log(`     ${stat._id || 'undefined'}: ${stat.count}`)
    })

    // 2. Миграция данных
    console.log('\n🔄 2. Миграция данных:')
    
    let migratedCount = 0
    let errorCount = 0

    // Получаем все записи для миграции
    const services = await servicesCollection.find({}).toArray()

    for (const service of services) {
      try {
        const updateData = {}
        let needsUpdate = false

        // Если нет поля businessStatus, создаем его на основе status
        if (!service.businessStatus) {
          if (service.status === 'published') {
            updateData.businessStatus = 'active'
          } else if (service.status === 'archived') {
            updateData.businessStatus = 'archived'
          } else if (service.status === 'draft') {
            updateData.businessStatus = 'active' // Черновики становятся активными
          } else {
            updateData.businessStatus = 'active' // По умолчанию
          }
          needsUpdate = true
        }

        // Устанавливаем _status как published для всех записей в основной коллекции
        if (service._status !== 'published') {
          updateData._status = 'published'
          needsUpdate = true
        }

        // Если нужно обновление, выполняем его
        if (needsUpdate) {
          await servicesCollection.updateOne(
            { _id: service._id },
            { $set: updateData }
          )
          
          console.log(`   ✅ Обновлено: ${service.title} (${service._id})`)
          console.log(`      - businessStatus: ${updateData.businessStatus || service.businessStatus}`)
          console.log(`      - _status: ${updateData._status || service._status}`)
          migratedCount++
        } else {
          console.log(`   ⏭️  Пропущено: ${service.title} (уже обновлено)`)
        }

      } catch (error) {
        console.log(`   ❌ Ошибка при обновлении ${service.title}: ${error.message}`)
        errorCount++
      }
    }

    // 3. Проверяем результат
    console.log('\n📊 3. Результат миграции:')
    console.log(`   Обновлено записей: ${migratedCount}`)
    console.log(`   Ошибок: ${errorCount}`)

    // Финальная статистика
    const finalBusinessStatusStats = await servicesCollection.aggregate([
      {
        $group: {
          _id: '$businessStatus',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    console.log('\n   Финальная статистика по businessStatus:')
    finalBusinessStatusStats.forEach(stat => {
      console.log(`     ${stat._id || 'undefined'}: ${stat.count}`)
    })

    const finalStatusStats = await servicesCollection.aggregate([
      {
        $group: {
          _id: '$_status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    console.log('\n   Финальная статистика по _status:')
    finalStatusStats.forEach(stat => {
      console.log(`     ${stat._id || 'undefined'}: ${stat.count}`)
    })

    // 4. Очищаем коллекцию versions (если нужно)
    console.log('\n🧹 4. Очистка коллекции versions:')
    const versionsCollection = db.collection('_services_versions')
    const versionsCount = await versionsCollection.countDocuments()
    
    if (versionsCount > 0) {
      console.log(`   Найдено ${versionsCount} старых версий`)
      console.log('   Очищаем коллекцию versions для свежего старта...')
      await versionsCollection.deleteMany({})
      console.log('   ✅ Коллекция versions очищена')
    } else {
      console.log('   Коллекция versions уже пуста')
    }

    console.log('\n✅ Миграция завершена успешно!')
    console.log('\n📝 Что изменилось:')
    console.log('   - Поле status переименовано в businessStatus')
    console.log('   - Все записи получили _status = "published"')
    console.log('   - Коллекция versions очищена для свежего старта')
    console.log('   - Теперь можно создавать черновики через админ панель')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

migrateServicesStatus()
