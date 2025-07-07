#!/usr/bin/env tsx

/**
 * Скрипт для тестирования миграции API эндпоинтов
 * Проверяет, что новые API пути работают правильно
 */

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

interface TestResult {
  endpoint: string
  status: 'success' | 'error'
  message: string
  data?: any
}

async function testEndpoint(path: string, params: Record<string, string> = {}): Promise<TestResult> {
  try {
    const url = new URL(path, BASE_URL)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    logDebug(`Testing: ${url.toString()}`)
    
    const response = await fetch(url.toString())
    const data = await response.json()

    if (!response.ok) {
      return {
        endpoint: path,
        status: 'error',
        message: `HTTP ${response.status}: ${data.error || 'Unknown error'}`,
        data
      }
    }

    return {
      endpoint: path,
      status: 'success',
      message: `Success - returned ${data.docs?.length || data.plans?.length || 'unknown'} items`,
      data
    }
  } catch (error) {
    return {
      endpoint: path,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function main() {
  logInfo('🚀 Starting API migration tests...\n')

  const tests: Array<{ path: string; params?: Record<string, string>; description: string }> = [
    {
      path: '/api/services',
      params: { businessStatus: 'active', locale: 'en' },
      description: 'Services API (English)'
    },
    {
      path: '/api/services',
      params: { businessStatus: 'active', locale: 'ru' },
      description: 'Services API (Russian)'
    },
    {
      path: '/api/subscription/plans',
      params: { status: 'active', locale: 'en' },
      description: 'Subscription Plans API (English)'
    },
    {
      path: '/api/subscription/plans',
      params: { status: 'active', locale: 'ru' },
      description: 'Subscription Plans API (Russian)'
    },
    {
      path: '/api/subscription/plans',
      params: { status: 'active', category: 'ai-agency', locale: 'en' },
      description: 'AI Agency Plans API (English)'
    },
    {
      path: '/api/products',
      params: { locale: 'en', limit: '5' },
      description: 'Products API (English)'
    },
    {
      path: '/api/products',
      params: { locale: 'ru', limit: '5' },
      description: 'Products API (Russian)'
    }
  ]

  const results: TestResult[] = []

  for (const test of tests) {
    logInfo(`📡 Testing: ${test.description}`)
    const result = await testEndpoint(test.path, test.params)
    results.push(result)
    
    if (result.status === 'success') {
      logInfo(`✅ ${result.message}`)
    } else {
      logError(`❌ ${result.message}`)
    }
    
    // Проверяем локализацию для subscription plans
    if (test.path.includes('subscription/plans') && result.status === 'success' && result.data?.plans) {
      const plans = result.data.plans
      if (plans.length > 0) {
        const firstPlan = plans[0]
        logDebug(`   Plan name: ${JSON.stringify(firstPlan.name)}`)
        logDebug(`   Plan description: ${JSON.stringify(firstPlan.description)}`)
      }
    }
    
    // Проверяем локализацию для services
    if (test.path.includes('services') && result.status === 'success' && result.data?.docs) {
      const services = result.data.docs
      if (services.length > 0) {
        const firstService = services[0]
        logDebug(`   Service title: ${JSON.stringify(firstService.title)}`)
        logDebug(`   Service description: ${JSON.stringify(firstService.description)}`)
      }
    }
    
    logInfo('')
  }

  // Сводка результатов
  logInfo('📊 Test Summary:')
  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  
  logInfo(`✅ Successful: ${successCount}`)
  logInfo(`❌ Failed: ${errorCount}`)
  
  if (errorCount > 0) {
    logError('\n🚨 Failed tests:')
    results.filter(r => r.status === 'error').forEach(result => {
      logError(`   ${result.endpoint}: ${result.message}`)
    })
  }
  
  logInfo('\n🎉 API migration tests completed!')
}

if (require.main === module) {
  main().catch(error => {
    logError('Test script failed:', error)
    process.exit(1)
  })
}

export { main as testApiMigration }
