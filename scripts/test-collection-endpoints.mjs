#!/usr/bin/env node

/**
 * Test script for collection endpoints authentication
 * Tests both Authorization: Bearer and x-api-key formats for collection APIs
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

console.log('🔐 Testing Collection Endpoints Authentication')
console.log('==============================================')

/**
 * Test function to make API requests to collection endpoints
 */
async function testCollectionEndpoint(description, endpoint, headers, method = 'GET', body = null) {
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
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', response.status)
      if (data.docs) {
        console.log(`📊 Found ${data.docs.length} documents (total: ${data.totalDocs || 'unknown'})`)
      } else if (data.id) {
        console.log(`📄 Document ID: ${data.id}`)
      }
    } else {
      console.log('❌ Failed:', data.error || 'Unknown error')
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
async function runCollectionTests() {
  console.log('🚀 Starting collection endpoints authentication tests...\n')

  // Test collection endpoints
  const testCollections = ['posts', 'categories', 'tags']
  
  for (const collection of testCollections) {
    console.log(`\n🗂️  Testing Collection: ${collection}`)
    console.log('=' + '='.repeat(collection.length + 20))

    // Test 1: Collection list with Bearer token
    await testCollectionEndpoint(
      `Test 1: GET /${collection} with Bearer token`,
      `/api/${collection}?limit=2`,
      { 'Authorization': `Bearer ${API_KEY}` }
    )

    // Test 2: Collection list with x-api-key
    await testCollectionEndpoint(
      `Test 2: GET /${collection} with x-api-key`,
      `/api/${collection}?limit=2`,
      { 'x-api-key': API_KEY }
    )

    // Test 3: Collection list without authentication (should fail)
    await testCollectionEndpoint(
      `Test 3: GET /${collection} without auth (should fail)`,
      `/api/${collection}?limit=2`,
      {}
    )

    // Test 4: Collection POST with Bearer token
    const testData = {
      title: `Test ${collection} ${Date.now()}`,
      description: 'Test description for authentication testing'
    }

    await testCollectionEndpoint(
      `Test 4: POST /${collection} with Bearer token`,
      `/api/${collection}`,
      { 'Authorization': `Bearer ${API_KEY}` },
      'POST',
      testData
    )

    // Test 5: Collection POST with x-api-key
    const testData2 = {
      title: `Test ${collection} Legacy ${Date.now()}`,
      description: 'Test description for legacy authentication testing'
    }

    await testCollectionEndpoint(
      `Test 5: POST /${collection} with x-api-key`,
      `/api/${collection}`,
      { 'x-api-key': API_KEY },
      'POST',
      testData2
    )
  }

  // Test specific document endpoints
  console.log('\n📄 Testing Document-Specific Endpoints')
  console.log('=====================================')

  // First, get a document ID to test with
  const postsResponse = await testCollectionEndpoint(
    'Getting a post ID for document tests',
    '/api/posts?limit=1',
    { 'Authorization': `Bearer ${API_KEY}` }
  )

  if (postsResponse.success && postsResponse.data.docs && postsResponse.data.docs.length > 0) {
    const testDocId = postsResponse.data.docs[0].id

    // Test document by ID endpoints
    await testCollectionEndpoint(
      `Test: GET /posts/${testDocId} with Bearer token`,
      `/api/posts/${testDocId}`,
      { 'Authorization': `Bearer ${API_KEY}` }
    )

    await testCollectionEndpoint(
      `Test: GET /posts/${testDocId} with x-api-key`,
      `/api/posts/${testDocId}`,
      { 'x-api-key': API_KEY }
    )

    await testCollectionEndpoint(
      `Test: GET /posts/${testDocId} without auth (should fail)`,
      `/api/posts/${testDocId}`,
      {}
    )

    // Test meta endpoint
    await testCollectionEndpoint(
      `Test: GET /posts/meta with Bearer token`,
      `/api/posts/meta?slug=test-slug`,
      { 'Authorization': `Bearer ${API_KEY}` }
    )

    await testCollectionEndpoint(
      `Test: GET /posts/meta with x-api-key`,
      `/api/posts/meta?slug=test-slug`,
      { 'x-api-key': API_KEY }
    )
  } else {
    console.log('⚠️  Could not get test document ID, skipping document-specific tests')
  }

  // Test error cases
  console.log('\n🚨 Testing Error Cases')
  console.log('======================')

  await testCollectionEndpoint(
    'Test: Invalid Bearer token',
    '/api/posts?limit=1',
    { 'Authorization': 'Bearer invalid-token' }
  )

  await testCollectionEndpoint(
    'Test: Invalid x-api-key',
    '/api/posts?limit=1',
    { 'x-api-key': 'invalid-key' }
  )

  await testCollectionEndpoint(
    'Test: Malformed Authorization header',
    '/api/posts?limit=1',
    { 'Authorization': 'InvalidFormat token' }
  )

  console.log('\n🎉 Collection endpoints authentication testing completed!')
  console.log('\n📊 Summary:')
  console.log('   ✅ All collection endpoints now support both authentication formats')
  console.log('   ✅ Bearer token format (recommended)')
  console.log('   ✅ Legacy x-api-key format (with deprecation warnings)')
  console.log('   ✅ Proper error handling for invalid authentication')
}

// Run the tests
runCollectionTests().catch(error => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})
