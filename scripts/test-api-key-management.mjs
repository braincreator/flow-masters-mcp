#!/usr/bin/env node

/**
 * Test script for API Key Management System
 * Tests the new enhanced API key management functionality
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '../.env.local') })

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.PAYLOAD_SECRET

if (!ADMIN_API_KEY) {
  console.error('❌ PAYLOAD_SECRET not found in environment variables')
  process.exit(1)
}

console.log('🔑 Testing API Key Management System')
console.log('===================================')

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0
}

/**
 * Test function with result tracking
 */
async function runTest(description, testFn) {
  testResults.total++
  console.log(`\n🧪 ${description}`)
  
  try {
    const result = await testFn()
    if (result.success) {
      console.log('✅ PASSED')
      testResults.passed++
      return result
    } else {
      console.log(`❌ FAILED: ${result.error || 'Unknown error'}`)
      testResults.failed++
      return result
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`)
    testResults.failed++
    return { success: false, error: error.message }
  }
}

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_API_KEY}`
    },
    ...options
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
 * Test API Key Management System
 */
async function testApiKeyManagement() {
  let createdKeyId = null
  let createdApiKey = null

  // Test 1: Get API key statistics
  await runTest('Get API key statistics', async () => {
    const { ok, data } = await apiRequest('/api/admin/api-keys?action=statistics')
    
    if (ok && data.success && typeof data.data.total === 'number') {
      console.log(`   Total keys: ${data.data.total}`)
      console.log(`   Enabled: ${data.data.enabled}`)
      console.log(`   Disabled: ${data.data.disabled}`)
      console.log(`   Expired: ${data.data.expired}`)
      return { success: true }
    }
    
    return { success: false, error: 'Invalid statistics response' }
  })

  // Test 2: List existing API keys
  await runTest('List existing API keys', async () => {
    const { ok, data } = await apiRequest('/api/admin/api-keys?action=list&limit=5')
    
    if (ok && data.success && Array.isArray(data.data.docs)) {
      console.log(`   Found ${data.data.docs.length} keys`)
      return { success: true }
    }
    
    return { success: false, error: 'Invalid list response' }
  })

  // Test 3: Create new API key
  const createResult = await runTest('Create new API key', async () => {
    const { ok, data } = await apiRequest('/api/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        name: 'Test API Key',
        description: 'Created by test script',
        keyType: 'development',
        permissions: ['read', 'write'],
        rateLimit: {
          enabled: true,
          requestsPerHour: 500,
          requestsPerMinute: 30
        },
        tags: [{ tag: 'test' }, { tag: 'automation' }]
      })
    })
    
    if (ok && data.success && data.data.key && data.data.id) {
      createdKeyId = data.data.id
      createdApiKey = data.data.key
      console.log(`   Created key ID: ${createdKeyId}`)
      console.log(`   Key preview: ${createdApiKey.substring(0, 8)}...`)
      return { success: true }
    }
    
    return { success: false, error: data.error || 'Failed to create key' }
  })

  // Test 4: Validate the created API key
  if (createdApiKey) {
    await runTest('Validate created API key', async () => {
      const { ok, data } = await apiRequest('/api/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({
          action: 'validate',
          key: createdApiKey,
          clientIP: '127.0.0.1'
        })
      })
      
      if (ok && data.success && data.data.isValid) {
        console.log(`   Permissions: ${data.data.permissions.join(', ')}`)
        console.log(`   Rate limit: ${data.data.rateLimit?.requestsPerHour}/hour`)
        return { success: true }
      }
      
      return { success: false, error: 'Key validation failed' }
    })
  }

  // Test 5: Test authentication with the new key
  if (createdApiKey) {
    await runTest('Test authentication with new key', async () => {
      const { ok } = await fetch(`${API_BASE}/api/test-enhanced-auth`, {
        headers: { 'Authorization': `Bearer ${createdApiKey}` }
      })
      
      return { success: ok }
    })
  }

  // Test 6: Update API key
  if (createdKeyId) {
    await runTest('Update API key', async () => {
      const { ok, data } = await apiRequest('/api/admin/api-keys', {
        method: 'PUT',
        body: JSON.stringify({
          keyId: createdKeyId,
          description: 'Updated by test script',
          permissions: ['read', 'write', 'debug'],
          notes: 'Test key updated via API'
        })
      })
      
      return { success: ok && data.success }
    })
  }

  // Test 7: Rotate API key
  if (createdKeyId) {
    const rotateResult = await runTest('Rotate API key', async () => {
      const { ok, data } = await apiRequest('/api/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({
          action: 'rotate',
          keyId: createdKeyId
        })
      })
      
      if (ok && data.success && data.data.newKey) {
        createdApiKey = data.data.newKey
        console.log(`   New key preview: ${createdApiKey.substring(0, 8)}...`)
        return { success: true }
      }
      
      return { success: false, error: data.error || 'Failed to rotate key' }
    })
  }

  // Test 8: Test authentication with rotated key
  if (createdApiKey) {
    await runTest('Test authentication with rotated key', async () => {
      const { ok } = await fetch(`${API_BASE}/api/test-enhanced-auth`, {
        headers: { 'Authorization': `Bearer ${createdApiKey}` }
      })
      
      return { success: ok }
    })
  }

  // Test 9: Disable API key
  if (createdKeyId) {
    await runTest('Disable API key', async () => {
      const { ok, data } = await apiRequest('/api/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({
          action: 'disable',
          keyId: createdKeyId
        })
      })
      
      return { success: ok && data.success }
    })
  }

  // Test 10: Test authentication with disabled key (should fail)
  if (createdApiKey) {
    await runTest('Test authentication with disabled key (should fail)', async () => {
      const { ok } = await fetch(`${API_BASE}/api/test-enhanced-auth`, {
        headers: { 'Authorization': `Bearer ${createdApiKey}` }
      })
      
      return { success: !ok } // Should fail
    })
  }

  // Test 11: Delete API key
  if (createdKeyId) {
    await runTest('Delete API key', async () => {
      const { ok, data } = await apiRequest(`/api/admin/api-keys?keyId=${createdKeyId}`, {
        method: 'DELETE'
      })
      
      return { success: ok && data.success }
    })
  }

  // Test 12: Filter API keys by type
  await runTest('Filter API keys by type', async () => {
    const { ok, data } = await apiRequest('/api/admin/api-keys?action=list&keyType=development&limit=5')
    
    if (ok && data.success && Array.isArray(data.data.docs)) {
      console.log(`   Found ${data.data.docs.length} development keys`)
      return { success: true }
    }
    
    return { success: false, error: 'Invalid filter response' }
  })

  // Test 13: Search API keys
  await runTest('Search API keys', async () => {
    const { ok, data } = await apiRequest('/api/admin/api-keys?action=list&search=test&limit=5')
    
    if (ok && data.success && Array.isArray(data.data.docs)) {
      console.log(`   Found ${data.data.docs.length} keys matching "test"`)
      return { success: true }
    }
    
    return { success: false, error: 'Invalid search response' }
  })
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  // Test 1: Create key without required fields
  await runTest('Create key without required fields (should fail)', async () => {
    const { ok, data } = await apiRequest('/api/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        description: 'Missing name and keyType'
      })
    })
    
    return { success: !ok && data.error } // Should fail
  })

  // Test 2: Validate invalid key
  await runTest('Validate invalid key', async () => {
    const { ok, data } = await apiRequest('/api/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify({
        action: 'validate',
        key: 'invalid-key-12345',
        clientIP: '127.0.0.1'
      })
    })
    
    if (ok && data.success && !data.data.isValid) {
      console.log(`   Error: ${data.data.error}`)
      return { success: true }
    }
    
    return { success: false, error: 'Should have failed validation' }
  })

  // Test 3: Access without admin authentication
  await runTest('Access without admin authentication (should fail)', async () => {
    const { ok } = await fetch(`${API_BASE}/api/admin/api-keys?action=statistics`)
    
    return { success: !ok } // Should fail
  })
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting API Key Management tests...\n')

  try {
    console.log('📋 Testing API Key Management')
    console.log('=============================')
    await testApiKeyManagement()

    console.log('\n🚨 Testing Error Handling')
    console.log('=========================')
    await testErrorHandling()

    // Print final results
    console.log('\n🏁 Test Results Summary')
    console.log('======================')
    console.log(`Total Tests: ${testResults.total}`)
    console.log(`✅ Passed: ${testResults.passed}`)
    console.log(`❌ Failed: ${testResults.failed}`)
    console.log(`📊 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`)

    if (testResults.failed === 0) {
      console.log('\n🎉 All tests passed! API Key Management system is working correctly.')
    } else {
      console.log(`\n⚠️  ${testResults.failed} test(s) failed. Please review the results above.`)
    }

  } catch (error) {
    console.error('❌ Test suite execution failed:', error)
    process.exit(1)
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('❌ API Key Management test suite failed:', error)
  process.exit(1)
})
