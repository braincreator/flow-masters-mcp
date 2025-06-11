#!/usr/bin/env node

/**
 * Скрипт для тестирования создания черновика в коллекции services
 */

const { MongoClient } = require('mongodb')

async function testDraftCreation() {
  console.log('🧪 Тестирование создания черновика в коллекции services...\n')

  const client = new MongoClient('mongodb://127.0.0.1:27017/flow-masters')

  try {
    await client.connect()
    console.log('✅ Подключение к MongoDB установлено\n')

    const db = client.db('flow-masters')
    
    // Проверяем все коллекции, связанные с services
    console.log('📋 Все коллекции в базе данных:')
    const collections = await db.listCollections().toArray()
    const serviceRelatedCollections = collections.filter(col => 
      col.name.includes('service') || col.name.includes('version')
    )
    
    serviceRelatedCollections.forEach(col => {
      console.log(`   - ${col.name}`)
    })

    // Проверяем основную коллекцию services
    const servicesCollection = db.collection('services')
    console.log('\n📊 Коллекция services:')
    
    // Получаем один документ для анализа структуры
    const sampleService = await servicesCollection.findOne()
    if (sampleService) {
      console.log('   Структура документа:')
      console.log(`   - _id: ${sampleService._id}`)
      console.log(`   - title: ${sampleService.title}`)
      console.log(`   - status: ${sampleService.status}`)
      console.log(`   - _status: ${sampleService._status}`)
      console.log(`   - createdAt: ${sampleService.createdAt}`)
      console.log(`   - updatedAt: ${sampleService.updatedAt}`)
      console.log(`   - versions: ${JSON.stringify(sampleService.versions)}`)
      
      // Проверяем все поля
      const fields = Object.keys(sampleService)
      console.log(`   - Всего полей: ${fields.length}`)
      console.log(`   - Поля: ${fields.join(', ')}`)
    }

    // Проверяем коллекцию services_versions (если существует)
    try {
      const versionsCollection = db.collection('services_versions')
      const versionsCount = await versionsCollection.countDocuments()
      console.log(`\n🔄 Коллекция services_versions: ${versionsCount} документов`)
      
      if (versionsCount > 0) {
        const sampleVersion = await versionsCollection.findOne()
        console.log('   Структура версии:')
        console.log(`   - _id: ${sampleVersion._id}`)
        console.log(`   - parent: ${sampleVersion.parent}`)
        console.log(`   - version: ${JSON.stringify(sampleVersion.version, null, 2)}`)
        console.log(`   - autosave: ${sampleVersion.autosave}`)
        console.log(`   - createdAt: ${sampleVersion.createdAt}`)
      }
    } catch (error) {
      console.log('\n❌ Коллекция services_versions не найдена или недоступна')
    }

    // Проверяем payload-preferences (настройки Payload)
    try {
      const preferencesCollection = db.collection('payload-preferences')
      const preferencesCount = await preferencesCollection.countDocuments()
      console.log(`\n⚙️ Коллекция payload-preferences: ${preferencesCount} документов`)
      
      if (preferencesCount > 0) {
        const preferences = await preferencesCollection.find().toArray()
        preferences.forEach(pref => {
          console.log(`   - ${pref.key}: ${JSON.stringify(pref.value)}`)
        })
      }
    } catch (error) {
      console.log('\n❌ Коллекция payload-preferences не найдена')
    }

    // Проверяем payload-migrations
    try {
      const migrationsCollection = db.collection('payload-migrations')
      const migrationsCount = await migrationsCollection.countDocuments()
      console.log(`\n🔄 Коллекция payload-migrations: ${migrationsCount} документов`)
      
      if (migrationsCount > 0) {
        const migrations = await migrationsCollection.find().sort({ batch: -1 }).limit(5).toArray()
        console.log('   Последние миграции:')
        migrations.forEach(migration => {
          console.log(`   - ${migration.name} (batch: ${migration.batch})`)
        })
      }
    } catch (error) {
      console.log('\n❌ Коллекция payload-migrations не найдена')
    }

    console.log('\n✅ Анализ завершен!')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

testDraftCreation()
