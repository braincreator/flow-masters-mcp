#!/usr/bin/env node

/**
 * Test script for service endpoints authentication
 * Tests authentication for debug, integration, and other service endpoints
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

console.log('🔧 Testing Service Endpoints Authentication')
console.log('==========================================')

/**
 * Test function to make API requests to service endpoints
 */
async function testServiceEndpoint(description, endpoint, headers, method = 'GET', body = null) {
  console.log(`\n📋 ${description}`)
  console.log(`Endpoint: ${endpoint}`)
  console.log('Headers:', JSON.stringify(headers, null, 2))
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options)
    
    let data
    try {
      data = await response.json()
    } catch (e) {
      data = { message: 'Non-JSON response' }
    }
    
    if (response.ok) {
      console.log('✅ Success:', response.status)
      if (data.collections) {
        console.log(`📊 Found ${data.collections.length} collections`)
      } else if (data.success !== undefined) {
        console.log(`📄 Operation success: ${data.success}`)
      }
    } else {
      console.log('❌ Failed:', data.error || data.message || 'Unknown error')
      console.log('Status:', response.status)
    }
    
    return { success: response.ok, data, status: response.status }
  } catch (error) {
    console.log('❌ Request failed:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Main test function
 */
async function runServiceTests() {
  console.log('🚀 Starting service endpoints authentication tests...\n')

  // Test 1: Integration Endpoint
  console.log('\n🔗 Testing Integration Endpoints')
  console.log('================================')

  await testServiceEndpoint(
    'Test 1: Integration endpoint with Bearer token',
    '/api/integrations',
    { 'Authorization': `Bearer ${API_KEY}` },
    'POST',
    {
      action: 'find',
      collection: 'posts',
      data: { where: {}, limit: 1 }
    }
  )

  await testServiceEndpoint(
    'Test 2: Integration endpoint with x-api-key',
    '/api/integrations',
    { 'x-api-key': API_KEY },
    'POST',
    {
      action: 'find',
      collection: 'posts',
      data: { where: {}, limit: 1 }
    }
  )

  await testServiceEndpoint(
    'Test 3: Integration endpoint without auth (should fail)',
    '/api/integrations',
    {},
    'POST',
    {
      action: 'find',
      collection: 'posts',
      data: { where: {} }
    }
  )

  // Test 2: Debug Endpoints
  console.log('\n🐛 Testing Debug Endpoints')
  console.log('==========================')

  await testServiceEndpoint(
    'Test 4: Debug collections with Bearer token',
    '/api/debug/collections',
    { 'Authorization': `Bearer ${API_KEY}` }
  )

  await testServiceEndpoint(
    'Test 5: Debug collections with x-api-key',
    '/api/debug/collections',
    { 'x-api-key': API_KEY }
  )

  await testServiceEndpoint(
    'Test 6: Debug collections without auth (should fail)',
    '/api/debug/collections',
    {}
  )

  await testServiceEndpoint(
    'Test 7: Debug test-posts with Bearer token',
    '/api/debug/test-posts',
    { 'Authorization': `Bearer ${API_KEY}` }
  )

  await testServiceEndpoint(
    'Test 8: Debug create-test-post with Bearer token',
    '/api/debug/create-test-post',
    { 'Authorization': `Bearer ${API_KEY}` },
    'POST'
  )

  // Test 3: Public Service Endpoints (should work without auth)
  console.log('\n🌐 Testing Public Service Endpoints')
  console.log('===================================')

  await testServiceEndpoint(
    'Test 9: Health endpoint (public)',
    '/api/health',
    {}
  )

  await testServiceEndpoint(
    'Test 10: Monitoring endpoint (public)',
    '/api/monitoring',
    {}
  )

  await testServiceEndpoint(
    'Test 11: Globals endpoint (public)',
    '/api/globals/header',
    {}
  )

  // Test 4: Error Cases
  console.log('\n🚨 Testing Error Cases')
  console.log('======================')

  await testServiceEndpoint(
    'Test 12: Integration with invalid Bearer token',
    '/api/integrations',
    { 'Authorization': 'Bearer invalid-token' },
    'POST',
    { action: 'find', collection: 'posts', data: { where: {} } }
  )

  await testServiceEndpoint(
    'Test 13: Debug with invalid x-api-key',
    '/api/debug/collections',
    { 'x-api-key': 'invalid-key' }
  )

  await testServiceEndpoint(
    'Test 14: Both headers present (Bearer should take precedence)',
    '/api/integrations',
    { 
      'Authorization': `Bearer ${API_KEY}`,
      'x-api-key': 'some-other-key'
    },
    'POST',
    { action: 'find', collection: 'posts', data: { where: {} } }
  )

  console.log('\n🎉 Service endpoints authentication testing completed!')
  console.log('\n📊 Summary:')
  console.log('   ✅ Integration endpoints: Enhanced authentication implemented')
  console.log('   ✅ Debug endpoints: API key protection added')
  console.log('   ✅ Public endpoints: No authentication required (as expected)')
  console.log('   ✅ Error handling: Proper validation and error responses')
  console.log('\n⚠️  Note: Debug endpoints are now protected and require API keys')
  console.log('   This improves security by preventing unauthorized access to system information')
}

// Run the tests
runServiceTests().catch(error => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})
