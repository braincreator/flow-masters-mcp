#!/usr/bin/env node

import { MongoClient } from 'mongodb'

async function testAdminAccess() {
  const client = new MongoClient('mongodb://localhost:27017')
  
  try {
    console.log('🔍 Testing admin access to services collection...')
    
    await client.connect()
    const db = client.db('flow-masters')
    
    // Check services collection
    const servicesCollection = db.collection('services')
    const servicesCount = await servicesCollection.countDocuments()
    console.log(`✅ Services collection: ${servicesCount} documents`)
    
    // Check users collection
    const usersCollection = db.collection('users')
    const adminUsers = await usersCollection.find({
      roles: { $in: ['admin'] }
    }).toArray()
    
    console.log(`✅ Admin users found: ${adminUsers.length}`)
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (roles: ${JSON.stringify(user.roles)})`)
    })
    
    // Check a sample service
    const sampleService = await servicesCollection.findOne({
      status: 'published'
    })
    
    if (sampleService) {
      console.log('✅ Sample published service:')
      console.log(`  - ID: ${sampleService._id}`)
      console.log(`  - Title: ${JSON.stringify(sampleService.title)}`)
      console.log(`  - Service Type: ${sampleService.serviceType}`)
      console.log(`  - Status: ${sampleService.status}`)
    } else {
      console.log('⚠️ No published services found')
    }
    
    // Check collections list
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name).sort()
    console.log(`\n📋 Available collections (${collections.length}):`)
    collectionNames.forEach(name => {
      if (name.includes('service')) {
        console.log(`  ✅ ${name}`)
      }
    })
    
    console.log('\n✅ Admin access test completed!')
    
  } catch (error) {
    console.error('❌ Error testing admin access:', error)
  } finally {
    await client.close()
  }
}

testAdminAccess()
