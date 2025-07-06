#!/usr/bin/env node

/**
 * Test script for enhanced authentication system
 * Tests both Authorization: Bearer and x-api-key formats
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

console.log('🔐 Testing Enhanced Authentication System')
console.log('==========================================')

/**
 * Test function to make API requests
 */
async function testAuth(description, headers) {
  console.log(`\n📋 ${description}`)
  console.log('Headers:', JSON.stringify(headers, null, 2))
  
  try {
    const response = await fetch(`${API_BASE}/api/test-enhanced-auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', data.message)
      if (data.metrics) {
        console.log('📊 Metrics:', data.metrics)
      }
    } else {
      console.log('❌ Failed:', data.error || 'Unknown error')
      console.log('Status:', response.status)
    }
    
    return { success: response.ok, data }
  } catch (error) {
    console.log('❌ Request failed:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Reset metrics for clean testing
 */
async function resetMetrics() {
  console.log('\n🔄 Resetting authentication metrics...')
  
  try {
    const response = await fetch(`${API_BASE}/api/test-enhanced-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Metrics reset successfully')
    } else {
      console.log('❌ Failed to reset metrics:', data.error)
    }
  } catch (error) {
    console.log('❌ Reset request failed:', error.message)
  }
}

/**
 * Main test function
 */
async function runTests() {
  // Reset metrics first
  await resetMetrics()

  // Test 1: New format (Authorization: Bearer)
  await testAuth(
    'Test 1: Authorization: Bearer format (recommended)',
    { 'Authorization': `Bearer ${API_KEY}` }
  )

  // Test 2: Legacy format (x-api-key)
  await testAuth(
    'Test 2: Legacy x-api-key format',
    { 'x-api-key': API_KEY }
  )

  // Test 3: No authentication
  await testAuth(
    'Test 3: No authentication (should fail)',
    {}
  )

  // Test 4: Invalid Bearer token
  await testAuth(
    'Test 4: Invalid Bearer token (should fail)',
    { 'Authorization': 'Bearer invalid-token' }
  )

  // Test 5: Invalid x-api-key
  await testAuth(
    'Test 5: Invalid x-api-key (should fail)',
    { 'x-api-key': 'invalid-key' }
  )

  // Test 6: Both headers (Bearer should take precedence)
  await testAuth(
    'Test 6: Both headers present (Bearer should take precedence)',
    { 
      'Authorization': `Bearer ${API_KEY}`,
      'x-api-key': 'some-other-key'
    }
  )

  // Test 7: Malformed Authorization header
  await testAuth(
    'Test 7: Malformed Authorization header (should fall back to x-api-key)',
    { 
      'Authorization': 'InvalidFormat token',
      'x-api-key': API_KEY
    }
  )

  // Final metrics check
  console.log('\n📊 Final Authentication Metrics Check')
  console.log('=====================================')
  
  const finalResult = await testAuth(
    'Getting final metrics',
    { 'Authorization': `Bearer ${API_KEY}` }
  )

  if (finalResult.success && finalResult.data.metrics) {
    const metrics = finalResult.data.metrics
    console.log('\n📈 Summary:')
    console.log(`   Bearer format used: ${metrics.bearer_usage} times`)
    console.log(`   Legacy format used: ${metrics.legacy_usage} times`)
    console.log(`   Total requests: ${metrics.total_requests} times`)
    
    if (metrics.legacy_usage > 0) {
      console.log('\n⚠️  Warning: Legacy x-api-key format was used.')
      console.log('   Consider migrating to Authorization: Bearer format.')
    }
  }

  console.log('\n🎉 Enhanced authentication testing completed!')
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})
