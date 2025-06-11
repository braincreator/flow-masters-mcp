#!/usr/bin/env node

/**
 * Скрипт для диагностики проблем с отображением в админ панели
 */

const { MongoClient } = require('mongodb')

async function debugAdminPanel() {
  console.log('🔍 Диагностика проблем с отображением в админ панели...\n')

  const client = new MongoClient('mongodb://127.0.0.1:27017/flow-masters')

  try {
    await client.connect()
    console.log('✅ Подключение к MongoDB установлено\n')

    const db = client.db('flow-masters')
    const servicesCollection = db.collection('services')
    const versionsCollection = db.collection('_services_versions')

    // 1. Проверяем основную коллекцию
    console.log('📊 1. Основная коллекция services:')
    const totalServices = await servicesCollection.countDocuments()
    console.log(`   Всего записей: ${totalServices}`)

    // 2. Проверяем поля, которые могут влиять на отображение
    console.log('\n🔍 2. Анализ полей для отображения в админ панели:')
    
    const sampleService = await servicesCollection.findOne()
    if (sampleService) {
      console.log('   Структура записи:')
      console.log(`   - _id: ${sampleService._id}`)
      console.log(`   - _status: ${sampleService._status}`)
      console.log(`   - businessStatus: ${sampleService.businessStatus}`)
      console.log(`   - status (старое): ${sampleService.status}`)
      console.log(`   - title: ${JSON.stringify(sampleService.title)}`)
      console.log(`   - createdAt: ${sampleService.createdAt}`)
      console.log(`   - updatedAt: ${sampleService.updatedAt}`)
      console.log(`   - __v: ${sampleService.__v}`)
      
      // Проверяем наличие всех необходимых полей
      const requiredFields = ['_id', '_status', 'title', 'serviceType', 'createdAt', 'updatedAt']
      const missingFields = requiredFields.filter(field => !sampleService.hasOwnProperty(field))
      
      if (missingFields.length > 0) {
        console.log(`   ❌ Отсутствующие поля: ${missingFields.join(', ')}`)
      } else {
        console.log(`   ✅ Все необходимые поля присутствуют`)
      }
    }

    // 3. Проверяем коллекцию versions
    console.log('\n🔄 3. Коллекция versions:')
    const totalVersions = await versionsCollection.countDocuments()
    console.log(`   Всего версий: ${totalVersions}`)

    if (totalVersions > 0) {
      const sampleVersion = await versionsCollection.findOne()
      console.log('   Структура версии:')
      console.log(`   - _id: ${sampleVersion._id}`)
      console.log(`   - parent: ${sampleVersion.parent}`)
      console.log(`   - version._status: ${sampleVersion.version?._status}`)
      console.log(`   - autosave: ${sampleVersion.autosave}`)
      console.log(`   - latest: ${sampleVersion.latest}`)
    }

    // 4. Проверяем возможные проблемы с versions
    console.log('\n⚠️ 4. Проверка возможных проблем:')
    
    // Проверяем, есть ли записи только в versions без parent в основной коллекции
    if (totalVersions > 0) {
      const versionsWithoutParent = await versionsCollection.aggregate([
        {
          $lookup: {
            from: 'services',
            localField: 'parent',
            foreignField: '_id',
            as: 'parentDoc'
          }
        },
        {
          $match: {
            parentDoc: { $size: 0 }
          }
        }
      ]).toArray()

      if (versionsWithoutParent.length > 0) {
        console.log(`   ❌ Найдено ${versionsWithoutParent.length} версий без parent в основной коллекции`)
        versionsWithoutParent.forEach((version, index) => {
          console.log(`     ${index + 1}. Version ID: ${version._id}, Parent: ${version.parent}`)
        })
      } else {
        console.log(`   ✅ Все версии имеют корректные parent записи`)
      }
    }

    // 5. Проверяем, могут ли записи быть "скрыты" из-за versions
    console.log('\n🎭 5. Проверка "скрытых" записей:')
    
    // Возможно, Payload CMS ожидает определенную структуру versions
    const servicesWithoutVersions = await servicesCollection.find({
      $or: [
        { versions: { $exists: false } },
        { versions: null },
        { versions: { $size: 0 } }
      ]
    }).toArray()

    console.log(`   Записей без поля versions: ${servicesWithoutVersions.length}`)
    
    if (servicesWithoutVersions.length > 0) {
      console.log('   Примеры записей без versions:')
      servicesWithoutVersions.slice(0, 3).forEach((service, index) => {
        const title = typeof service.title === 'object' 
          ? (service.title.ru || service.title.en) 
          : service.title
        console.log(`     ${index + 1}. ${title} (ID: ${service._id})`)
      })
    }

    // 6. Тестируем Payload API напрямую
    console.log('\n🔌 6. Тестирование Payload API:')
    
    try {
      // Тест админского API
      const adminResponse = await fetch('http://localhost:3000/api/services', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json()
        console.log(`   ✅ Админский API (/api/services): ${adminData.docs?.length || 0} записей`)
        
        if (adminData.docs && adminData.docs.length > 0) {
          console.log('   Первая запись из админского API:')
          const firstDoc = adminData.docs[0]
          console.log(`     - ID: ${firstDoc.id}`)
          console.log(`     - _status: ${firstDoc._status}`)
          console.log(`     - title: ${JSON.stringify(firstDoc.title)}`)
        }
      } else {
        console.log(`   ❌ Админский API ошибка: ${adminResponse.status}`)
        const errorText = await adminResponse.text()
        console.log(`   Ошибка: ${errorText.substring(0, 200)}...`)
      }
    } catch (error) {
      console.log(`   ❌ Ошибка при тестировании админского API: ${error.message}`)
    }

    // 7. Проверяем настройки доступа
    console.log('\n🔐 7. Проверка настроек доступа:')
    console.log('   Настройки access в коллекции services:')
    console.log('   - read: () => true (публичное чтение)')
    console.log('   - create: isAdmin (только админы)')
    console.log('   - update: isAdmin (только админы)')
    console.log('   - delete: isAdmin (только админы)')

    // 8. Итоговые рекомендации
    console.log('\n🎯 8. Возможные причины и решения:')
    
    if (totalServices === 0) {
      console.log('   ❌ КРИТИЧНО: Нет записей в основной коллекции')
    } else if (totalVersions > totalServices * 2) {
      console.log('   ⚠️ Слишком много версий - возможно, записи "застряли" в versions')
    } else {
      console.log('   ✅ Количество записей нормальное')
    }

    console.log('\n📋 Рекомендации:')
    console.log('   1. Проверить авторизацию в админ панели')
    console.log('   2. Очистить кэш браузера')
    console.log('   3. Перезапустить сервер разработки')
    console.log('   4. Проверить консоль браузера на ошибки')
    console.log('   5. Проверить настройки фильтров в админ панели')

    console.log('\n✅ Диагностика завершена!')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

debugAdminPanel()
