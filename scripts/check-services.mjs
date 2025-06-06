#!/usr/bin/env node

import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function checkServices() {
  try {
    console.log('🔍 Checking services collection...')
    
    // Initialize Payload
    const payload = await getPayload({ config })
    
    // Check if services collection exists
    const collections = payload.config.collections
    const servicesCollection = collections.find(col => col.slug === 'services')
    
    if (!servicesCollection) {
      console.error('❌ Services collection not found in config!')
      return
    }
    
    console.log('✅ Services collection found in config')
    console.log('📋 Collection details:')
    console.log(`  - Slug: ${servicesCollection.slug}`)
    console.log(`  - Admin group: ${servicesCollection.admin?.group}`)
    console.log(`  - Use as title: ${servicesCollection.admin?.useAsTitle}`)
    console.log(`  - Default columns: ${JSON.stringify(servicesCollection.admin?.defaultColumns)}`)
    
    // Try to fetch services from database
    console.log('\n🗄️ Checking database...')
    
    const services = await payload.find({
      collection: 'services',
      limit: 5,
      depth: 0
    })
    
    console.log(`✅ Found ${services.totalDocs} services in database`)
    
    if (services.docs.length > 0) {
      console.log('📄 Sample service:')
      const sample = services.docs[0]
      console.log(`  - ID: ${sample.id}`)
      console.log(`  - Title: ${JSON.stringify(sample.title)}`)
      console.log(`  - Service Type: ${sample.serviceType}`)
      console.log(`  - Status: ${sample.status}`)
      console.log(`  - Published At: ${sample.publishedAt}`)
    }
    
    // Check access permissions
    console.log('\n🔐 Checking access permissions...')
    
    // Try to find admin users
    const adminUsers = await payload.find({
      collection: 'users',
      where: {
        roles: {
          contains: 'admin'
        }
      },
      limit: 5
    })
    
    console.log(`✅ Found ${adminUsers.totalDocs} admin users`)
    
    if (adminUsers.docs.length > 0) {
      console.log('👤 Admin users:')
      adminUsers.docs.forEach(user => {
        console.log(`  - ${user.email} (roles: ${JSON.stringify(user.roles)})`)
      })
    }
    
    console.log('\n✅ Services collection check completed successfully!')
    
  } catch (error) {
    console.error('❌ Error checking services:', error)
    console.error(error.stack)
  } finally {
    process.exit(0)
  }
}

checkServices()
