#!/usr/bin/env node

/**
 * Скрипт для проверки черновиков в коллекции services
 */

const { MongoClient } = require('mongodb')

async function checkServicesDrafts() {
  console.log('🔍 Проверка черновиков в коллекции services...\n')

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

    // 2. Статистика по статусам
    console.log('\n📋 2. Статистика по статусам:')
    const statusStats = await servicesCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    statusStats.forEach(stat => {
      console.log(`   ${stat._id || 'undefined'}: ${stat.count}`)
    })

    // 3. Проверяем записи с черновиками
    console.log('\n📝 3. Записи со статусом "draft":')
    const draftServices = await servicesCollection.find({ status: 'draft' }).limit(10).toArray()
    
    if (draftServices.length > 0) {
      draftServices.forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.title} (ID: ${service._id})`)
        console.log(`      - createdAt: ${service.createdAt}`)
        console.log(`      - updatedAt: ${service.updatedAt}`)
        console.log(`      - _status: ${service._status}`)
        console.log(`      - hasVersions: ${!!service.versions}`)
      })
    } else {
      console.log('   Нет записей со статусом "draft"')
    }

    // 4. Проверяем коллекцию versions
    console.log('\n🔄 4. Проверка коллекции versions:')
    const versionsCollection = db.collection('services_versions')
    const versionsCount = await versionsCollection.countDocuments()
    console.log(`   Всего версий: ${versionsCount}`)

    if (versionsCount > 0) {
      const versionStats = await versionsCollection.aggregate([
        {
          $group: {
            _id: '$version._status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray()

      console.log('   Статистика версий по статусам:')
      versionStats.forEach(stat => {
        console.log(`     ${stat._id || 'undefined'}: ${stat.count}`)
      })

      // Показываем несколько версий
      const sampleVersions = await versionsCollection.find().limit(5).toArray()
      console.log('\n   Примеры версий:')
      sampleVersions.forEach((version, index) => {
        console.log(`     ${index + 1}. Parent: ${version.parent}, Status: ${version.version?._status}`)
        console.log(`        - createdAt: ${version.createdAt}`)
        console.log(`        - autosave: ${version.autosave}`)
      })
    }

    // 5. Проверяем связанные коллекции
    console.log('\n🔗 5. Проверка связанных коллекций:')
    
    // Проверяем orders
    const ordersCollection = db.collection('orders')
    const ordersWithServices = await ordersCollection.countDocuments({
      'items.service': { $exists: true }
    })
    console.log(`   Заказы со ссылками на services: ${ordersWithServices}`)

    // Проверяем service-projects
    const serviceProjectsCollection = db.collection('service-projects')
    const serviceProjectsCount = await serviceProjectsCollection.countDocuments()
    console.log(`   Проекты услуг: ${serviceProjectsCount}`)

    console.log('\n✅ Проверка завершена!')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

checkServicesDrafts()
