import { BeforeSync } from '@payloadcms/plugin-search/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export const beforeSyncWithSearch: BeforeSync = async ({ 
  collection, 
  doc, 
  operation 
}) => {
  const batchSize = 100
  const searchFields = ['title', 'content', 'description']
  
  for (const field of searchFields) {
    if (doc[field] && typeof doc[field] === 'string' && doc[field].length > 1000) {
      const chunks = doc[field].match(/.{1,1000}/g) || []
      doc[`${field}_indexed`] = chunks.map(chunk => 
        chunk.toLowerCase().trim()
      ).join(' ')
    }
  }

  if (operation === 'delete') {
    await cleanupSearchData(collection, doc.id)
  }

  return doc
}

// Add cleanup function
export const cleanupStaleSearchIndices = async () => {
  const staleThreshold = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days
  // Implementation depends on your search storage mechanism
  // Add appropriate cleanup logic here
}

// Schedule cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(async () => {
    try {
      await cleanupStaleSearchIndices()
    } catch (error) {
      logError('Search index cleanup failed:', error)
    }
  }, 24 * 60 * 60 * 1000) // Daily cleanup
}
