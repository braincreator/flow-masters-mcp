#!/usr/bin/env node

/**
 * Comprehensive Authentication System Test Suite
 * Tests all aspects of the enhanced authentication system
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '../.env.local') })

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const API_KEY = process.env.PAYLOAD_SECRET

if (!API_KEY) {
  console.error('❌ PAYLOAD_SECRET not found in environment variables')
  process.exit(1)
}

console.log('🧪 Comprehensive Authentication System Test Suite')
console.log('================================================')
console.log(`🔗 Testing against: ${API_BASE}`)
console.log(`🔑 Using API key: ${API_KEY.substring(0, 8)}...`)

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  categories: {},
}

/**
 * Test function with result tracking
 */
async function runTest(category, description, testFn) {
  testResults.total++

  if (!testResults.categories[category]) {
    testResults.categories[category] = { total: 0, passed: 0, failed: 0 }
  }
  testResults.categories[category].total++

  console.log(`\n🧪 [${category}] ${description}`)

  try {
    const result = await testFn()
    if (result.success) {
      console.log('✅ PASSED')
      testResults.passed++
      testResults.categories[category].passed++
    } else {
      console.log(`❌ FAILED: ${result.error || 'Unknown error'}`)
      testResults.failed++
      testResults.categories[category].failed++
    }
    return result
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`)
    testResults.failed++
    testResults.categories[category].failed++
    return { success: false, error: error.message }
  }
}

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  let data
  try {
    data = await response.json()
  } catch (e) {
    data = { message: 'Non-JSON response' }
  }

  return { response, data, status: response.status, ok: response.ok }
}

/**
 * Test Categories
 */

// 1. Enhanced Authentication System Tests
async function testEnhancedAuth() {
  console.log('\n🔐 Testing Enhanced Authentication System')
  console.log('========================================')

  await runTest('Enhanced Auth', 'Bearer token authentication', async () => {
    const { ok } = await apiRequest('/api/test-enhanced-auth', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    return { success: ok }
  })

  await runTest('Enhanced Auth', 'Legacy x-api-key authentication', async () => {
    const { ok } = await apiRequest('/api/test-enhanced-auth', {
      headers: { 'x-api-key': API_KEY },
    })
    return { success: ok }
  })

  await runTest('Enhanced Auth', 'No authentication (should fail)', async () => {
    const { ok } = await apiRequest('/api/test-enhanced-auth')
    return { success: !ok } // Should fail
  })

  await runTest('Enhanced Auth', 'Invalid Bearer token (should fail)', async () => {
    const { ok } = await apiRequest('/api/test-enhanced-auth', {
      headers: { Authorization: 'Bearer invalid-token' },
    })
    return { success: !ok } // Should fail
  })
}

// 2. Collection Endpoints Tests
async function testCollectionEndpoints() {
  console.log('\n📚 Testing Collection Endpoints')
  console.log('===============================')

  const collections = ['posts', 'categories']

  for (const collection of collections) {
    await runTest('Collections', `${collection} with Bearer token`, async () => {
      const { ok } = await apiRequest(`/api/${collection}?limit=1`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      })
      return { success: ok }
    })

    await runTest('Collections', `${collection} with x-api-key`, async () => {
      const { ok } = await apiRequest(`/api/${collection}?limit=1`, {
        headers: { 'x-api-key': API_KEY },
      })
      return { success: ok }
    })

    await runTest('Collections', `${collection} without auth (should fail)`, async () => {
      const { ok } = await apiRequest(`/api/${collection}?limit=1`)
      return { success: !ok } // Should fail
    })
  }
}

// 3. Service Endpoints Tests
async function testServiceEndpoints() {
  console.log('\n🔧 Testing Service Endpoints')
  console.log('============================')

  await runTest('Services', 'Integration endpoint with Bearer token', async () => {
    const { ok } = await apiRequest('/api/integrations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        action: 'find',
        collection: 'posts',
        data: { where: {}, limit: 1 },
      }),
    })
    return { success: ok }
  })

  await runTest('Services', 'Debug endpoint with Bearer token', async () => {
    const { ok } = await apiRequest('/api/debug/collections', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    return { success: ok }
  })

  await runTest('Services', 'Public health endpoint (no auth)', async () => {
    const { ok } = await apiRequest('/api/health')
    return { success: ok }
  })
}

// 4. Middleware Tests
async function testMiddleware() {
  console.log('\n🛡️  Testing Authentication Middleware')
  console.log('====================================')

  await runTest('Middleware', 'Middleware health check', async () => {
    const { ok, data } = await apiRequest('/api/auth-middleware?action=health', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    return { success: ok && data.middleware?.status === 'healthy' }
  })

  await runTest('Middleware', 'Middleware configuration', async () => {
    const { ok, data } = await apiRequest('/api/auth-middleware?action=config', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    return { success: ok && data.configuration?.features?.dual_format_support }
  })

  await runTest('Middleware', 'Reset metrics', async () => {
    const { ok } = await apiRequest('/api/auth-middleware', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ action: 'reset_metrics' }),
    })
    return { success: ok }
  })
}

// 5. Error Handling Tests
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling')
  console.log('=========================')

  await runTest('Error Handling', 'Invalid API key format', async () => {
    const { ok, status } = await apiRequest('/api/posts?limit=1', {
      headers: { Authorization: 'InvalidFormat token' },
    })
    return { success: !ok && status === 401 }
  })

  await runTest('Error Handling', 'Empty Authorization header', async () => {
    const { ok, status } = await apiRequest('/api/posts?limit=1', {
      headers: { Authorization: '' },
    })
    return { success: !ok && status === 401 }
  })

  await runTest('Error Handling', 'Both headers with invalid Bearer', async () => {
    const { ok } = await apiRequest('/api/posts?limit=1', {
      headers: {
        Authorization: 'Bearer invalid',
        'x-api-key': API_KEY,
      },
    })
    return { success: ok } // Should succeed with x-api-key fallback
  })
}

// 6. Performance Tests
async function testPerformance() {
  console.log('\n⚡ Testing Performance')
  console.log('=====================')

  await runTest('Performance', 'Authentication response time', async () => {
    const start = Date.now()
    const { ok } = await apiRequest('/api/test-enhanced-auth', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    const duration = Date.now() - start

    console.log(`   Response time: ${duration}ms`)
    return { success: ok && duration < 1000 } // Should be under 1 second
  })

  await runTest('Performance', 'Multiple concurrent requests', async () => {
    const requests = Array(5)
      .fill()
      .map(() =>
        apiRequest('/api/test-enhanced-auth', {
          headers: { Authorization: `Bearer ${API_KEY}` },
        }),
      )

    const start = Date.now()
    const results = await Promise.all(requests)
    const duration = Date.now() - start

    const allSuccessful = results.every((r) => r.ok)
    console.log(`   Concurrent requests time: ${duration}ms`)
    return { success: allSuccessful && duration < 2000 }
  })
}

// 7. Metrics and Monitoring Tests
async function testMetrics() {
  console.log('\n📊 Testing Metrics and Monitoring')
  console.log('=================================')

  // Generate some traffic first
  await apiRequest('/api/test-enhanced-auth', {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  await apiRequest('/api/test-enhanced-auth', {
    headers: { 'x-api-key': API_KEY },
  })

  await runTest('Metrics', 'Authentication metrics collection', async () => {
    const { ok, data } = await apiRequest('/api/auth-middleware?action=metrics', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })

    const hasMetrics =
      data.metrics &&
      typeof data.metrics.total_requests === 'number' &&
      typeof data.metrics.bearer_requests === 'number'

    return { success: ok && hasMetrics }
  })

  await runTest('Metrics', 'Migration status tracking', async () => {
    const { ok, data } = await apiRequest('/api/auth-middleware?action=metrics', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })

    const hasRecommendations =
      data.recommendations &&
      data.recommendations.migration_status &&
      data.recommendations.suggestion

    return { success: ok && hasRecommendations }
  })
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting comprehensive authentication tests...\n')

  try {
    await testEnhancedAuth()
    await testCollectionEndpoints()
    await testServiceEndpoints()
    await testMiddleware()
    await testErrorHandling()
    await testPerformance()
    await testMetrics()

    // Print final results
    console.log('\n🏁 Test Results Summary')
    console.log('======================')
    console.log(`Total Tests: ${testResults.total}`)
    console.log(`✅ Passed: ${testResults.passed}`)
    console.log(`❌ Failed: ${testResults.failed}`)
    console.log(`📊 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`)

    console.log('\n📋 Results by Category:')
    for (const [category, results] of Object.entries(testResults.categories)) {
      const successRate = Math.round((results.passed / results.total) * 100)
      console.log(`   ${category}: ${results.passed}/${results.total} (${successRate}%)`)
    }

    if (testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Authentication system is working correctly.')
    } else {
      console.log(`\n⚠️  ${testResults.failed} test(s) failed. Please review the results above.`)
    }

    // Get final metrics
    const { data } = await apiRequest('/api/auth-middleware?action=metrics', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })

    if (data?.metrics) {
      console.log('\n📈 Final Authentication Metrics:')
      console.log(`   Bearer requests: ${data.metrics.bearer_requests}`)
      console.log(`   Legacy requests: ${data.metrics.legacy_requests}`)
      console.log(`   Total requests: ${data.metrics.total_requests}`)
    }
  } catch (error) {
    console.error('❌ Test suite execution failed:', error)
    process.exit(1)
  }
}

// Run all tests
runAllTests().catch((error) => {
  console.error('❌ Comprehensive test suite failed:', error)
  process.exit(1)
})
