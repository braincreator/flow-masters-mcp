#!/usr/bin/env tsx

/**
 * Script to clear all TermsPages collection data
 * Run with: npx tsx src/scripts/clear-terms-pages.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
async function clearTermsPages() {
  logDebug('🗑️  Clearing TermsPages collection...')

  try {
    const payload = await getPayloadClient()
    logDebug('✅ Payload client initialized')

    // Find all existing terms pages
    const existing = await payload.find({
      collection: 'terms-pages',
      limit: 100,
    })

    logDebug(`Found ${existing.docs.length} existing terms pages to delete`)

    // Delete each document
    for (const doc of existing.docs) {
      try {
        await payload.delete({
          collection: 'terms-pages',
          id: doc.id,
        })
        logDebug(`✅ Deleted terms page: ${doc.id} (${doc.title || doc.tabType})`)
      } catch (error) {
        logError(`❌ Error deleting terms page ${doc.id}:`, error)
      }
    }

    logDebug('🎉 All terms pages cleared!')
  } catch (error) {
    logError('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
clearTermsPages()
