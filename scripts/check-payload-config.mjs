#!/usr/bin/env node

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function checkPayloadConfig() {
  try {
    console.log('🔍 Checking Payload configuration...')
    
    // Import the config
    const configPath = path.resolve(__dirname, '../src/payload.config.ts')
    console.log(`📁 Config path: ${configPath}`)
    
    // Try to import the collections list
    const { default: collections } = await import('../src/collections/collectionList.ts')
    console.log(`✅ Collections imported: ${collections.length} collections`)
    
    // Check if Services is in the list
    const servicesCollection = collections.find(col => col.slug === 'services')
    if (servicesCollection) {
      console.log('✅ Services collection found in collections list')
      console.log(`  - Slug: ${servicesCollection.slug}`)
      console.log(`  - Admin group: ${servicesCollection.admin?.group}`)
      console.log(`  - Use as title: ${servicesCollection.admin?.useAsTitle}`)
      console.log(`  - Default columns: ${JSON.stringify(servicesCollection.admin?.defaultColumns)}`)
      
      // Check access configuration
      if (servicesCollection.access) {
        console.log('✅ Access configuration found:')
        console.log(`  - Read: ${typeof servicesCollection.access.read}`)
        console.log(`  - Create: ${typeof servicesCollection.access.create}`)
        console.log(`  - Update: ${typeof servicesCollection.access.update}`)
        console.log(`  - Delete: ${typeof servicesCollection.access.delete}`)
      }
      
      // Check fields
      if (servicesCollection.fields) {
        console.log(`✅ Fields configuration: ${servicesCollection.fields.length} fields`)
        const fieldNames = servicesCollection.fields
          .filter(field => field && typeof field === 'object' && 'name' in field)
          .map(field => field.name)
        console.log(`  - Field names: ${fieldNames.join(', ')}`)
      }
    } else {
      console.error('❌ Services collection NOT found in collections list!')
      console.log('Available collections:')
      collections.forEach(col => {
        if (col && col.slug) {
          console.log(`  - ${col.slug}`)
        }
      })
    }
    
    console.log('\n✅ Payload configuration check completed!')
    
  } catch (error) {
    console.error('❌ Error checking Payload configuration:', error)
    console.error(error.stack)
  }
}

checkPayloadConfig()
