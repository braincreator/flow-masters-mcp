#!/usr/bin/env node

/**
 * Быстрый тест API эндпоинтов после миграции
 */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

async function testEndpoint(path, params = {}) {
  try {
    const url = new URL(path, BASE_URL)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    console.log(`🔍 Testing: ${url.toString()}`)
    
    const response = await fetch(url.toString())
    const data = await response.json()

    if (!response.ok) {
      console.log(`❌ Error ${response.status}: ${data.error || 'Unknown error'}`)
      return false
    }

    const itemCount = data.docs?.length || data.plans?.length || 'unknown'
    console.log(`✅ Success - returned ${itemCount} items`)
    
    // Проверяем локализацию
    if (data.docs && data.docs.length > 0) {
      const firstItem = data.docs[0]
      if (firstItem.title) {
        console.log(`   Title: ${JSON.stringify(firstItem.title)}`)
      }
    }
    
    if (data.plans && data.plans.length > 0) {
      const firstPlan = data.plans[0]
      if (firstPlan.name) {
        console.log(`   Plan name: ${JSON.stringify(firstPlan.name)}`)
      }
    }
    
    return true
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Quick API Migration Test\n')

  const tests = [
    { path: '/api/services', params: { businessStatus: 'active', locale: 'en' }, name: 'Services (EN)' },
    { path: '/api/services', params: { businessStatus: 'active', locale: 'ru' }, name: 'Services (RU)' },
    { path: '/api/subscription/plans', params: { status: 'active', locale: 'en' }, name: 'Plans (EN)' },
    { path: '/api/subscription/plans', params: { status: 'active', locale: 'ru' }, name: 'Plans (RU)' },
  ]

  let passed = 0
  let total = tests.length

  for (const test of tests) {
    console.log(`\n📡 ${test.name}`)
    const success = await testEndpoint(test.path, test.params)
    if (success) passed++
  }

  console.log(`\n📊 Results: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All tests passed!')
  } else {
    console.log('⚠️  Some tests failed. Check the API endpoints.')
  }
}

main().catch(console.error)
