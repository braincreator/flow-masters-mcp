#!/usr/bin/env tsx

/**
 * Test script to verify services API and media loading
 * Run with: npx tsx src/scripts/test-services-api.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
async function testServicesAPI() {
  logDebug('🧪 Testing Services API and Media Loading...')
  
  try {
    const payload = await getPayloadClient()
    logDebug('✅ Payload client initialized')

    // Test 1: Basic services query
    logDebug('\n📋 Test 1: Basic services query')
    const startTime = Date.now()
    
    const services = await payload.find({
      collection: 'services',
      limit: 5,
      depth: 1,
    })
    
    const queryTime = Date.now() - startTime
    logDebug(`✅ Query completed in ${queryTime}ms`)
    logDebug(`📊 Found ${services.docs.length} services`)

    // Test 2: Check media relationships
    logDebug('\n🖼️  Test 2: Check media relationships')
    for (const service of services.docs) {
      logDebug(`\n📝 Service: ${service.title}`)
      
      // Check thumbnail
      if (service.thumbnail) {
        if (typeof service.thumbnail === 'string') {
          logDebug(`  📷 Thumbnail: ${service.thumbnail} (string reference)`)
        } else if (service.thumbnail && typeof service.thumbnail === 'object') {
          console.log(`  📷 Thumbnail: ${service.thumbnail.url || 'No URL'} (populated object)`)
          logDebug(`  📏 Thumbnail ID: ${service.thumbnail.id}`)
        }
      } else {
        logDebug('  📷 No thumbnail')
      }

      // Check gallery
      if (service.gallery && Array.isArray(service.gallery)) {
        logDebug(`  🖼️  Gallery: ${service.gallery.length} images`)
        service.gallery.forEach((item: any, index: number) => {
          if (item.image) {
            if (typeof item.image === 'string') {
              logDebug(`    ${index + 1}. ${item.image} (string reference)`)
            } else if (item.image && typeof item.image === 'object') {
              console.log(`    ${index + 1}. ${item.image.url || 'No URL'} (populated object)`)
            }
          }
        })
      }

      // Check related services
      if (service.relatedServices && Array.isArray(service.relatedServices)) {
        logDebug(`  🔗 Related services: ${service.relatedServices.length}`)
        service.relatedServices.forEach((related: any, index: number) => {
          if (typeof related === 'string') {
            logDebug(`    ${index + 1}. ${related} (string reference)`)
          } else if (related && typeof related === 'object') {
            logDebug(`    ${index + 1}. ${related.title || related.id} (populated object)`)
          }
        })
      }
    }

    // Test 3: Test specific service with slug
    logDebug('\n🔍 Test 3: Test service by slug')
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
      logDebug(`✅ Found service: ${service.title}`)
      logDebug(`📷 Thumbnail type: ${typeof service.thumbnail}`)
      
      if (service.thumbnail && typeof service.thumbnail === 'object') {
        logDebug(`📷 Thumbnail URL: ${service.thumbnail.url}`)
        logDebug(`📷 Thumbnail filename: ${service.thumbnail.filename}`)
      }
    }

    // Test 4: Test media collection directly
    logDebug('\n🖼️  Test 4: Test media collection')
    const mediaStartTime = Date.now()
    
    const media = await payload.find({
      collection: 'media',
      limit: 3,
      depth: 0,
    })
    
    const mediaQueryTime = Date.now() - mediaStartTime
    logDebug(`✅ Media query completed in ${mediaQueryTime}ms`)
    logDebug(`📊 Found ${media.docs.length} media items`)

    media.docs.forEach((item: any, index: number) => {
      logDebug(`  ${index + 1}. ${item.filename} - ${item.url}`)
    })

    logDebug('\n🎉 All tests completed successfully!')
    
  } catch (error) {
    logError('❌ Test failed:', error)
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    process.exit(1)
  }
}

// Run the test
testServicesAPI()
  .then(() => {
    logDebug('✅ Test script completed')
    process.exit(0)
  })
  .catch((error) => {
    logError('❌ Test script failed:', error)
    process.exit(1)
  })
