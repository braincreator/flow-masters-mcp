#!/usr/bin/env node

async function testPayloadAPI() {
  try {
    console.log('🔍 Testing Payload API...')
    
    // Test the services API endpoint
    const baseUrl = 'http://localhost:3000'
    
    console.log('📡 Testing services API endpoint...')
    
    const response = await fetch(`${baseUrl}/api/services?status=published&limit=5`)
    
    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`)
      return
    }
    
    const data = await response.json()
    
    console.log(`✅ API response received`)
    console.log(`📊 Total services: ${data.totalDocs || 'unknown'}`)
    console.log(`📄 Services in response: ${data.docs?.length || 0}`)
    
    if (data.docs && data.docs.length > 0) {
      console.log('\n📋 Sample services:')
      data.docs.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.title?.ru || service.title?.en || service.title || 'No title'}`)
        console.log(`     Type: ${service.serviceType}`)
        console.log(`     Status: ${service.status}`)
        console.log(`     ID: ${service.id}`)
      })
    } else {
      console.log('⚠️ No services found in API response')
    }
    
    // Test admin panel access (this will likely fail without authentication)
    console.log('\n🔐 Testing admin panel access...')
    
    try {
      const adminResponse = await fetch(`${baseUrl}/admin`)
      console.log(`📡 Admin panel response: ${adminResponse.status}`)
      
      if (adminResponse.status === 200) {
        console.log('✅ Admin panel is accessible')
      } else if (adminResponse.status === 302 || adminResponse.status === 401) {
        console.log('🔒 Admin panel requires authentication (expected)')
      } else {
        console.log(`⚠️ Unexpected admin panel response: ${adminResponse.status}`)
      }
    } catch (adminError) {
      console.log(`❌ Admin panel test failed: ${adminError.message}`)
    }
    
    console.log('\n✅ Payload API test completed!')
    
  } catch (error) {
    console.error('❌ Error testing Payload API:', error)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on http://localhost:3000')
      console.log('   Try running: npm run dev or pnpm dev')
    }
  }
}

testPayloadAPI()
