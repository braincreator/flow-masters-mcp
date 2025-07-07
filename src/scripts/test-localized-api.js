#!/usr/bin/env node

/**
 * Test script to verify localized API endpoints for categories and tags
 */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

async function testAPI(url, description) {
  logDebug(`\n🔍 Testing: ${description}`)
  logDebug(`📡 URL: ${url}`)
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (response.ok) {
      logDebug(`✅ Success: ${response.status}`)
      console.log(`📊 Data length: ${Array.isArray(data) ? data.length : data.docs?.length || 'N/A'}`)
      
      // Show first item if available
      const firstItem = Array.isArray(data) ? data[0] : data.docs?.[0]
      if (firstItem) {
        logDebug(`📝 First item: ${firstItem.title} (${firstItem.slug})`)
      }
    } else {
      logDebug(`❌ Error: ${response.status}`)
      console.log(`💬 Message: ${data.error || data.message || 'Unknown error'}`)
    }
  } catch (error) {
    logDebug(`💥 Request failed: ${error.message}`)
  }
}

async function runTests() {
  logDebug('🚀 Testing Localized API Endpoints for Categories and Tags\n')
  logDebug(`🌐 Base URL: ${BASE_URL}`)
  
  const tests = [
    // Categories tests
    {
      url: `${BASE_URL}/api/categories?locale=en`,
      description: 'Categories (English)'
    },
    {
      url: `${BASE_URL}/api/categories?locale=ru`,
      description: 'Categories (Russian)'
    },
    {
      url: `${BASE_URL}/api/categories`,
      description: 'Categories (Default locale)'
    },
    
    // Tags tests
    {
      url: `${BASE_URL}/api/tags?locale=en`,
      description: 'Tags (English)'
    },
    {
      url: `${BASE_URL}/api/tags?locale=ru`,
      description: 'Tags (Russian)'
    },
    {
      url: `${BASE_URL}/api/tags`,
      description: 'Tags (Default locale)'
    }
  ]
  
  for (const test of tests) {
    await testAPI(test.url, test.description)
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  logDebug('\n✨ Testing completed!')
}

// Run the tests
runTests().catch(console.error)
