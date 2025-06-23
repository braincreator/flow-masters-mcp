/**
 * Тест создания услуги через Payload API
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters'

async function testCreateService() {
  console.log('🧪 Тестируем создание услуги через API...')
  
  try {
    // Создаем через API
    const response = await fetch('http://localhost:3000/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: {
          ru: "Тестовая услуга",
          en: "Test Service"
        },
        serviceType: "consultation",
        shortDescription: {
          ru: "Тестовое описание",
          en: "Test description"
        },
        price: {
          ru: 1000,
          en: 11
        },
        status: "published",
        _status: "published",
        slug: "test-service"
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Услуга создана через API:', result.id)
      
      // Проверяем в базе
      const client = new MongoClient(DATABASE_URI)
      await client.connect()
      const db = client.db('flow-masters')
      
      const apiCreated = await db.collection('services').findOne({ _id: result.id })
      const directCreated = await db.collection('services').findOne({ slug: 'express-ai-consultation' })
      
      console.log('\n📊 Сравнение структур:')
      console.log('API created fields:', Object.keys(apiCreated || {}))
      console.log('Direct created fields:', Object.keys(directCreated || {}))
      
      // Проверяем различия
      const apiFields = new Set(Object.keys(apiCreated || {}))
      const directFields = new Set(Object.keys(directCreated || {}))
      
      const onlyInApi = [...apiFields].filter(f => !directFields.has(f))
      const onlyInDirect = [...directFields].filter(f => !apiFields.has(f))
      
      if (onlyInApi.length > 0) {
        console.log('🔍 Поля только в API записи:', onlyInApi)
      }
      if (onlyInDirect.length > 0) {
        console.log('🔍 Поля только в прямой записи:', onlyInDirect)
      }
      
      await client.close()
    } else {
      console.error('❌ Ошибка API:', response.status, await response.text())
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

testCreateService()
