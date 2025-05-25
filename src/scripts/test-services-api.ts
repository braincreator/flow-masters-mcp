#!/usr/bin/env tsx

/**
 * Test script to verify services API and media loading
 * Run with: npx tsx src/scripts/test-services-api.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

async function testServicesAPI() {
  console.log('🧪 Testing Services API and Media Loading...')
  
  try {
    const payload = await getPayloadClient()
    console.log('✅ Payload client initialized')

    // Test 1: Basic services query
    console.log('\n📋 Test 1: Basic services query')
    const startTime = Date.now()
    
    const services = await payload.find({
      collection: 'services',
      limit: 5,
      depth: 1,
    })
    
    const queryTime = Date.now() - startTime
    console.log(`✅ Query completed in ${queryTime}ms`)
    console.log(`📊 Found ${services.docs.length} services`)

    // Test 2: Check media relationships
    console.log('\n🖼️  Test 2: Check media relationships')
    for (const service of services.docs) {
      console.log(`\n📝 Service: ${service.title}`)
      
      // Check thumbnail
      if (service.thumbnail) {
        if (typeof service.thumbnail === 'string') {
          console.log(`  📷 Thumbnail: ${service.thumbnail} (string reference)`)
        } else if (service.thumbnail && typeof service.thumbnail === 'object') {
          console.log(`  📷 Thumbnail: ${service.thumbnail.url || 'No URL'} (populated object)`)
          console.log(`  📏 Thumbnail ID: ${service.thumbnail.id}`)
        }
      } else {
        console.log('  📷 No thumbnail')
      }

      // Check gallery
      if (service.gallery && Array.isArray(service.gallery)) {
        console.log(`  🖼️  Gallery: ${service.gallery.length} images`)
        service.gallery.forEach((item: any, index: number) => {
          if (item.image) {
            if (typeof item.image === 'string') {
              console.log(`    ${index + 1}. ${item.image} (string reference)`)
            } else if (item.image && typeof item.image === 'object') {
              console.log(`    ${index + 1}. ${item.image.url || 'No URL'} (populated object)`)
            }
          }
        })
      }

      // Check related services
      if (service.relatedServices && Array.isArray(service.relatedServices)) {
        console.log(`  🔗 Related services: ${service.relatedServices.length}`)
        service.relatedServices.forEach((related: any, index: number) => {
          if (typeof related === 'string') {
            console.log(`    ${index + 1}. ${related} (string reference)`)
          } else if (related && typeof related === 'object') {
            console.log(`    ${index + 1}. ${related.title || related.id} (populated object)`)
          }
        })
      }
    }

    // Test 3: Test specific service with slug
    console.log('\n🔍 Test 3: Test service by slug')
    const serviceBySlug = await payload.find({
      collection: 'services',
      where: {
        status: { equals: 'published' }
      },
      limit: 1,
      depth: 1,
    })

    if (serviceBySlug.docs.length > 0) {
      const service = serviceBySlug.docs[0]
      console.log(`✅ Found service: ${service.title}`)
      console.log(`📷 Thumbnail type: ${typeof service.thumbnail}`)
      
      if (service.thumbnail && typeof service.thumbnail === 'object') {
        console.log(`📷 Thumbnail URL: ${service.thumbnail.url}`)
        console.log(`📷 Thumbnail filename: ${service.thumbnail.filename}`)
      }
    }

    // Test 4: Test media collection directly
    console.log('\n🖼️  Test 4: Test media collection')
    const mediaStartTime = Date.now()
    
    const media = await payload.find({
      collection: 'media',
      limit: 3,
      depth: 0,
    })
    
    const mediaQueryTime = Date.now() - mediaStartTime
    console.log(`✅ Media query completed in ${mediaQueryTime}ms`)
    console.log(`📊 Found ${media.docs.length} media items`)

    media.docs.forEach((item: any, index: number) => {
      console.log(`  ${index + 1}. ${item.filename} - ${item.url}`)
    })

    console.log('\n🎉 All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    process.exit(1)
  }
}

// Run the test
testServicesAPI()
  .then(() => {
    console.log('✅ Test script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
