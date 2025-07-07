#!/usr/bin/env node

/**
 * Тест локализации планов подписки
 */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

async function testSubscriptionPlansLocale() {
  console.log('🧪 Testing Subscription Plans Localization\n')

  const tests = [
    {
      name: 'English locale via query param',
      url: `${BASE_URL}/api/subscription/plans?locale=en&status=active`,
      expectedLocale: 'en'
    },
    {
      name: 'Russian locale via query param',
      url: `${BASE_URL}/api/subscription/plans?locale=ru&status=active`,
      expectedLocale: 'ru'
    },
    {
      name: 'English locale via Accept-Language header',
      url: `${BASE_URL}/api/subscription/plans?status=active`,
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
      expectedLocale: 'en'
    },
    {
      name: 'Russian locale via Accept-Language header',
      url: `${BASE_URL}/api/subscription/plans?status=active`,
      headers: { 'Accept-Language': 'ru-RU,ru;q=0.9' },
      expectedLocale: 'ru'
    }
  ]

  for (const test of tests) {
    console.log(`📡 ${test.name}`)
    console.log(`   URL: ${test.url}`)
    
    try {
      const response = await fetch(test.url, {
        headers: test.headers || {}
      })
      
      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`)
        continue
      }
      
      const data = await response.json()
      
      if (!data.success || !data.plans || data.plans.length === 0) {
        console.log(`   ❌ No plans returned`)
        continue
      }
      
      const firstPlan = data.plans[0]
      console.log(`   ✅ Got ${data.plans.length} plans`)
      console.log(`   📝 First plan name: "${firstPlan.name}"`)
      console.log(`   📝 First plan description: "${firstPlan.description}"`)
      console.log(`   💰 Price: ${firstPlan.price} ${firstPlan.currency}`)
      
      // Проверяем, соответствует ли контент ожидаемой локали
      if (test.expectedLocale === 'en') {
        const isEnglish = /^[a-zA-Z\s\-\(\)]+$/.test(firstPlan.name)
        console.log(`   🔍 Content appears to be English: ${isEnglish ? '✅' : '❌'}`)
      } else {
        const isRussian = /[а-яё]/i.test(firstPlan.name)
        console.log(`   🔍 Content appears to be Russian: ${isRussian ? '✅' : '❌'}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    console.log('')
  }
}

// Также тестируем прямой запрос к Payload CMS
async function testPayloadDirectly() {
  console.log('🔧 Testing Payload CMS directly\n')
  
  try {
    // Импортируем Payload клиент
    const { getPayloadClient } = await import('../utilities/payload/index.js')
    const payload = await getPayloadClient()
    
    console.log('📡 Testing Payload find with locale=en')
    const resultEn = await payload.find({
      collection: 'subscription-plans',
      locale: 'en',
      where: { isActive: { equals: true } },
      limit: 1
    })
    
    if (resultEn.docs.length > 0) {
      const plan = resultEn.docs[0]
      console.log(`   ✅ Found plan: "${plan.name}"`)
      console.log(`   📝 Description: "${plan.description}"`)
      console.log(`   💰 Price: ${plan.price} ${plan.currency}`)
    } else {
      console.log('   ❌ No plans found for EN locale')
    }
    
    console.log('\n📡 Testing Payload find with locale=ru')
    const resultRu = await payload.find({
      collection: 'subscription-plans',
      locale: 'ru',
      where: { isActive: { equals: true } },
      limit: 1
    })
    
    if (resultRu.docs.length > 0) {
      const plan = resultRu.docs[0]
      console.log(`   ✅ Found plan: "${plan.name}"`)
      console.log(`   📝 Description: "${plan.description}"`)
      console.log(`   💰 Price: ${plan.price} ${plan.currency}`)
    } else {
      console.log('   ❌ No plans found for RU locale')
    }
    
  } catch (error) {
    console.log(`   ❌ Error testing Payload directly: ${error.message}`)
  }
}

async function main() {
  await testSubscriptionPlansLocale()
  await testPayloadDirectly()
  console.log('🎉 Testing completed!')
}

main().catch(console.error)
