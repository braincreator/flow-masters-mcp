#!/usr/bin/env node

/**
 * Простой тест API планов подписки
 */

const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('🧪 Testing Subscription Plans API\n')

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
    }
  ]

  for (const test of tests) {
    console.log(`📡 ${test.name}`)
    console.log(`   URL: ${test.url}`)
    
    try {
      const response = await fetch(test.url)
      
      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`)
        continue
      }
      
      const data = await response.json()
      
      if (!data.success || !data.plans || data.plans.length === 0) {
        console.log(`   ❌ No plans returned`)
        console.log(`   Response:`, JSON.stringify(data, null, 2))
        continue
      }
      
      const firstPlan = data.plans[0]
      console.log(`   ✅ Got ${data.plans.length} plans`)
      console.log(`   📝 First plan name: "${firstPlan.name}"`)
      console.log(`   📝 First plan description: "${firstPlan.description?.substring(0, 50)}..."`)
      console.log(`   💰 Price: ${firstPlan.price} ${firstPlan.currency}`)
      
      // Проверяем, соответствует ли контент ожидаемой локали
      if (test.expectedLocale === 'en') {
        const isEnglish = /^[a-zA-Z\s\-\(\)]+$/.test(firstPlan.name)
        console.log(`   🔍 Content appears to be English: ${isEnglish ? '✅' : '❌'}`)
        if (!isEnglish) {
          console.log(`   🔍 Name contains non-English characters: "${firstPlan.name}"`)
        }
      } else {
        const isRussian = /[а-яё]/i.test(firstPlan.name)
        console.log(`   🔍 Content appears to be Russian: ${isRussian ? '✅' : '❌'}`)
        if (!isRussian) {
          console.log(`   🔍 Name doesn't contain Russian characters: "${firstPlan.name}"`)
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    console.log('')
  }
}

async function main() {
  console.log('🚀 Starting API test...')
  console.log('Make sure the server is running on http://localhost:3000\n')
  
  await testAPI()
  
  console.log('🎉 Test completed!')
}

main().catch(console.error)
