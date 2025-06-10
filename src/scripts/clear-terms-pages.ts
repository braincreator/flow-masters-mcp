#!/usr/bin/env tsx

/**
 * Script to clear all TermsPages collection data
 * Run with: npx tsx src/scripts/clear-terms-pages.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

async function clearTermsPages() {
  console.log('🗑️  Clearing TermsPages collection...')

  try {
    const payload = await getPayloadClient()
    console.log('✅ Payload client initialized')

    // Find all existing terms pages
    const existing = await payload.find({
      collection: 'terms-pages',
      limit: 100,
    })

    console.log(`Found ${existing.docs.length} existing terms pages to delete`)

    // Delete each document
    for (const doc of existing.docs) {
      try {
        await payload.delete({
          collection: 'terms-pages',
          id: doc.id,
        })
        console.log(`✅ Deleted terms page: ${doc.id} (${doc.title || doc.tabType})`)
      } catch (error) {
        console.error(`❌ Error deleting terms page ${doc.id}:`, error)
      }
    }

    console.log('🎉 All terms pages cleared!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
clearTermsPages()
