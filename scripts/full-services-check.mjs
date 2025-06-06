#!/usr/bin/env node

import { MongoClient } from 'mongodb'

async function fullServicesCheck() {
  console.log('🔍 Full Services Collection Check')
  console.log('================================\n')
  
  const client = new MongoClient('mongodb://localhost:27017')
  
  try {
    await client.connect()
    const db = client.db('flow-masters')
    
    // 1. Check database connection
    console.log('1. 🗄️ Database Connection')
    console.log('✅ Connected to MongoDB')
    
    // 2. Check services collection exists
    console.log('\n2. 📋 Services Collection')
    const collections = await db.listCollections().toArray()
    const servicesExists = collections.some(c => c.name === 'services')
    
    if (servicesExists) {
      console.log('✅ Services collection exists')
    } else {
      console.log('❌ Services collection NOT found')
      return
    }
    
    // 3. Check services count
    const servicesCollection = db.collection('services')
    const totalServices = await servicesCollection.countDocuments()
    const publishedServices = await servicesCollection.countDocuments({ status: 'published' })
    
    console.log(`✅ Total services: ${totalServices}`)
    console.log(`✅ Published services: ${publishedServices}`)
    
    // 4. Check admin users
    console.log('\n3. 👤 Admin Users')
    const usersCollection = db.collection('users')
    const adminUsers = await usersCollection.find({
      roles: { $in: ['admin'] }
    }).toArray()
    
    console.log(`✅ Admin users found: ${adminUsers.length}`)
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (roles: ${JSON.stringify(user.roles)})`)
    })
    
    // 5. Check sample services structure
    console.log('\n4. 📄 Sample Services Structure')
    const sampleServices = await servicesCollection.find({
      status: 'published'
    }).limit(2).toArray()
    
    if (sampleServices.length > 0) {
      sampleServices.forEach((service, index) => {
        console.log(`\n  Service ${index + 1}:`)
        console.log(`    ID: ${service._id}`)
        console.log(`    Title: ${JSON.stringify(service.title)}`)
        console.log(`    Service Type: ${service.serviceType}`)
        console.log(`    Status: ${service.status}`)
        console.log(`    Price: ${JSON.stringify(service.price)}`)
        console.log(`    Slug: ${service.slug}`)
        console.log(`    Published At: ${service.publishedAt}`)
        
        // Check required fields
        const requiredFields = ['title', 'serviceType', 'description', 'shortDescription', 'price', 'status']
        const missingFields = requiredFields.filter(field => !service[field])
        
        if (missingFields.length > 0) {
          console.log(`    ⚠️ Missing fields: ${missingFields.join(', ')}`)
        } else {
          console.log(`    ✅ All required fields present`)
        }
      })
    } else {
      console.log('⚠️ No published services found')
    }
    
    // 6. Check for potential issues
    console.log('\n5. 🔍 Potential Issues Check')
    
    // Check for services without required fields
    const servicesWithoutTitle = await servicesCollection.countDocuments({
      $or: [
        { title: { $exists: false } },
        { title: null },
        { title: '' }
      ]
    })
    
    const servicesWithoutType = await servicesCollection.countDocuments({
      $or: [
        { serviceType: { $exists: false } },
        { serviceType: null },
        { serviceType: '' }
      ]
    })
    
    if (servicesWithoutTitle > 0) {
      console.log(`⚠️ Services without title: ${servicesWithoutTitle}`)
    }
    
    if (servicesWithoutType > 0) {
      console.log(`⚠️ Services without serviceType: ${servicesWithoutType}`)
    }
    
    if (servicesWithoutTitle === 0 && servicesWithoutType === 0) {
      console.log('✅ All services have required fields')
    }
    
    // 7. Summary
    console.log('\n6. 📊 Summary')
    console.log('==============')
    console.log(`Database: ✅ Connected`)
    console.log(`Services Collection: ✅ Exists`)
    console.log(`Total Services: ${totalServices}`)
    console.log(`Published Services: ${publishedServices}`)
    console.log(`Admin Users: ${adminUsers.length}`)
    
    if (totalServices > 0 && adminUsers.length > 0) {
      console.log('\n🎉 All basic requirements are met!')
      console.log('💡 If services are not showing in admin panel, the issue is likely:')
      console.log('   1. Frontend/admin panel configuration')
      console.log('   2. Authentication/authorization')
      console.log('   3. Payload CMS compilation issues')
    } else {
      console.log('\n❌ Basic requirements not met')
      if (totalServices === 0) {
        console.log('   - No services in database')
      }
      if (adminUsers.length === 0) {
        console.log('   - No admin users found')
      }
    }
    
  } catch (error) {
    console.error('❌ Error during check:', error)
  } finally {
    await client.close()
  }
}

fullServicesCheck()
