#!/usr/bin/env node

/**
 * Скрипт для проверки SEO метаданных у услуг
 */

const { MongoClient } = require('mongodb')

async function checkSeoMeta() {
  console.log('🔍 Проверка SEO метаданных у услуг...\n')

  const client = new MongoClient('mongodb://127.0.0.1:27017/flow-masters')

  try {
    await client.connect()
    console.log('✅ Подключение к MongoDB установлено\n')

    const db = client.db('flow-masters')
    const servicesCollection = db.collection('services')

    // 1. Получаем все услуги
    console.log('📊 1. Анализ SEO метаданных:')
    const allServices = await servicesCollection.find({}).toArray()
    console.log(`   Всего услуг: ${allServices.length}`)

    let servicesWithoutMeta = []
    let servicesWithIncompleteMeta = []
    let servicesWithCompleteMeta = []

    // 2. Анализируем каждую услугу
    console.log('\n📋 2. Детальный анализ по услугам:')
    
    allServices.forEach((service, index) => {
      const title = typeof service.title === 'object' 
        ? (service.title.ru || service.title.en || 'Без названия')
        : service.title || 'Без названия'
      
      console.log(`\n   ${index + 1}. ${title}`)
      console.log(`      ID: ${service._id}`)
      console.log(`      Тип: ${service.serviceType}`)
      
      // Проверяем meta поля
      const meta = service.meta || {}
      const hasMetaTitle = meta.title && (
        (typeof meta.title === 'object' && (meta.title.ru || meta.title.en)) ||
        (typeof meta.title === 'string' && meta.title.trim())
      )
      const hasMetaDescription = meta.description && (
        (typeof meta.description === 'object' && (meta.description.ru || meta.description.en)) ||
        (typeof meta.description === 'string' && meta.description.trim())
      )
      const hasMetaImage = meta.image

      console.log(`      Meta Title: ${hasMetaTitle ? '✅' : '❌'} ${hasMetaTitle ? (typeof meta.title === 'object' ? 'Локализовано' : 'Есть') : 'Отсутствует'}`)
      console.log(`      Meta Description: ${hasMetaDescription ? '✅' : '❌'} ${hasMetaDescription ? (typeof meta.description === 'object' ? 'Локализовано' : 'Есть') : 'Отсутствует'}`)
      console.log(`      Meta Image: ${hasMetaImage ? '✅' : '❌'} ${hasMetaImage ? 'Есть' : 'Отсутствует'}`)

      // Категоризируем услуги
      if (!hasMetaTitle && !hasMetaDescription && !hasMetaImage) {
        servicesWithoutMeta.push(service)
      } else if (!hasMetaTitle || !hasMetaDescription) {
        servicesWithIncompleteMeta.push(service)
      } else {
        servicesWithCompleteMeta.push(service)
      }
    })

    // 3. Статистика
    console.log('\n📊 3. Статистика SEO метаданных:')
    console.log(`   ✅ Полные метаданные: ${servicesWithCompleteMeta.length} услуг`)
    console.log(`   ⚠️ Неполные метаданные: ${servicesWithIncompleteMeta.length} услуг`)
    console.log(`   ❌ Без метаданных: ${servicesWithoutMeta.length} услуг`)

    // 4. Показываем услуги без метаданных
    if (servicesWithoutMeta.length > 0) {
      console.log('\n❌ 4. Услуги БЕЗ метаданных:')
      servicesWithoutMeta.forEach((service, index) => {
        const title = typeof service.title === 'object' 
          ? (service.title.ru || service.title.en)
          : service.title
        console.log(`   ${index + 1}. ${title} (${service.serviceType})`)
      })
    }

    // 5. Показываем услуги с неполными метаданными
    if (servicesWithIncompleteMeta.length > 0) {
      console.log('\n⚠️ 5. Услуги с НЕПОЛНЫМИ метаданными:')
      servicesWithIncompleteMeta.forEach((service, index) => {
        const title = typeof service.title === 'object' 
          ? (service.title.ru || service.title.en)
          : service.title
        console.log(`   ${index + 1}. ${title} (${service.serviceType})`)
        
        const meta = service.meta || {}
        const hasMetaTitle = meta.title && (
          (typeof meta.title === 'object' && (meta.title.ru || meta.title.en)) ||
          (typeof meta.title === 'string' && meta.title.trim())
        )
        const hasMetaDescription = meta.description && (
          (typeof meta.description === 'object' && (meta.description.ru || meta.description.en)) ||
          (typeof meta.description === 'string' && meta.description.trim())
        )
        
        if (!hasMetaTitle) console.log(`      - Отсутствует Meta Title`)
        if (!hasMetaDescription) console.log(`      - Отсутствует Meta Description`)
        if (!meta.image) console.log(`      - Отсутствует Meta Image`)
      })
    }

    // 6. Рекомендации
    console.log('\n🎯 6. Рекомендации:')
    
    if (servicesWithoutMeta.length > 0 || servicesWithIncompleteMeta.length > 0) {
      console.log('   📝 Необходимо добавить SEO метаданные для:')
      console.log(`      - ${servicesWithoutMeta.length} услуг без метаданных`)
      console.log(`      - ${servicesWithIncompleteMeta.length} услуг с неполными метаданными`)
      console.log('\n   💡 Рекомендуемая структура meta:')
      console.log('      - title: локализованный заголовок (50-60 символов)')
      console.log('      - description: локализованное описание (150-160 символов)')
      console.log('      - image: изображение для социальных сетей')
      console.log('\n   🔧 Хотите автоматически сгенерировать метаданные?')
      console.log('      Я могу создать скрипт для автоматического добавления SEO метаданных')
    } else {
      console.log('   ✅ Все услуги имеют полные SEO метаданные!')
    }

    console.log('\n✅ Проверка завершена!')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

checkSeoMeta()
