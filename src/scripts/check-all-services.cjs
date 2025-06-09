#!/usr/bin/env node

/**
 * Скрипт для проверки всех услуг и их отображения
 */

const { MongoClient } = require('mongodb')

async function checkAllServices() {
  console.log('🔍 Проверка всех услуг в коллекции services...\n')

  const client = new MongoClient('mongodb://127.0.0.1:27017/flow-masters')

  try {
    await client.connect()
    console.log('✅ Подключение к MongoDB установлено\n')

    const db = client.db('flow-masters')
    const servicesCollection = db.collection('services')

    // 1. Общая статистика
    console.log('📊 1. Общая статистика:')
    const totalCount = await servicesCollection.countDocuments()
    console.log(`   Всего записей: ${totalCount}`)

    // 2. Показываем все услуги
    console.log('\n📋 2. Все услуги в базе данных:')
    const allServices = await servicesCollection.find({}).toArray()
    
    if (allServices.length > 0) {
      allServices.forEach((service, index) => {
        const title = typeof service.title === 'object' 
          ? (service.title.ru || service.title.en || 'Без названия')
          : service.title || 'Без названия'
        
        console.log(`   ${index + 1}. ${title}`)
        console.log(`      - ID: ${service._id}`)
        console.log(`      - _status: ${service._status}`)
        console.log(`      - businessStatus: ${service.businessStatus}`)
        console.log(`      - status (старое): ${service.status}`)
        console.log(`      - serviceType: ${service.serviceType}`)
        console.log(`      - createdAt: ${service.createdAt}`)
        console.log(`      - updatedAt: ${service.updatedAt}`)
        console.log('')
      })
    } else {
      console.log('   ❌ НЕТ УСЛУГ В БАЗЕ ДАННЫХ!')
    }

    // 3. Проверяем статистику по полям
    console.log('📊 3. Статистика по полям:')
    
    const statusStats = await servicesCollection.aggregate([
      {
        $group: {
          _id: '$_status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    console.log('   По _status:')
    statusStats.forEach(stat => {
      console.log(`     ${stat._id || 'undefined'}: ${stat.count}`)
    })

    const businessStatusStats = await servicesCollection.aggregate([
      {
        $group: {
          _id: '$businessStatus',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    console.log('   По businessStatus:')
    businessStatusStats.forEach(stat => {
      console.log(`     ${stat._id || 'undefined'}: ${stat.count}`)
    })

    const oldStatusStats = await servicesCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    console.log('   По старому status:')
    oldStatusStats.forEach(stat => {
      console.log(`     ${stat._id || 'undefined'}: ${stat.count}`)
    })

    // 4. Тестируем API
    console.log('\n🌐 4. Тестирование API:')
    
    try {
      // Тест с _status=published
      const response1 = await fetch('http://localhost:3000/api/v1/services?_status=published')
      if (response1.ok) {
        const data1 = await response1.json()
        console.log(`   ✅ API с _status=published: ${data1.docs?.length || 0} услуг`)
      } else {
        console.log(`   ❌ API с _status=published ошибка: ${response1.status}`)
      }

      // Тест без фильтров
      const response2 = await fetch('http://localhost:3000/api/v1/services')
      if (response2.ok) {
        const data2 = await response2.json()
        console.log(`   ✅ API без фильтров: ${data2.docs?.length || 0} услуг`)
      } else {
        console.log(`   ❌ API без фильтров ошибка: ${response2.status}`)
      }

      // Тест со старым параметром status
      const response3 = await fetch('http://localhost:3000/api/v1/services?status=published')
      if (response3.ok) {
        const data3 = await response3.json()
        console.log(`   ✅ API со старым status=published: ${data3.docs?.length || 0} услуг`)
      } else {
        console.log(`   ❌ API со старым status=published ошибка: ${response3.status}`)
      }

    } catch (error) {
      console.log(`   ⚠️ API недоступен: ${error.message}`)
    }

    // 5. Проверяем админ панель
    console.log('\n🎛️ 5. Проверка доступности для админ панели:')
    
    const publishedServices = await servicesCollection.countDocuments({ _status: 'published' })
    const draftServices = await servicesCollection.countDocuments({ _status: 'draft' })
    const activeServices = await servicesCollection.countDocuments({ businessStatus: 'active' })
    const hiddenServices = await servicesCollection.countDocuments({ businessStatus: 'hidden' })
    
    console.log(`   Опубликованные (_status: published): ${publishedServices}`)
    console.log(`   Черновики (_status: draft): ${draftServices}`)
    console.log(`   Активные (businessStatus: active): ${activeServices}`)
    console.log(`   Скрытые (businessStatus: hidden): ${hiddenServices}`)

    // 6. Итоговая оценка
    console.log('\n🎯 6. Итоговая оценка:')
    
    if (totalCount === 0) {
      console.log('   ❌ КРИТИЧЕСКАЯ ПРОБЛЕМА: Все услуги исчезли!')
      console.log('   Необходимо восстановить данные из бэкапа.')
    } else if (publishedServices === 0) {
      console.log('   ⚠️ ПРОБЛЕМА: Услуги есть, но ни одна не опубликована!')
      console.log('   Нужно исправить поле _status.')
    } else {
      console.log('   ✅ Услуги на месте и доступны!')
      console.log(`   Всего: ${totalCount}, Опубликованных: ${publishedServices}`)
    }

    console.log('\n✅ Проверка завершена!')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

checkAllServices()
