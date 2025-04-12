import collections from './collectionList'
import type { CollectionConfig } from 'payload'

console.log('[slugs.ts Module] Initializing.') // HMR Debug Log

// Export a function that returns the array
export const getCollections = (): CollectionConfig[] => {
  console.log('[slugs.ts Function] getCollections() called.') // HMR Debug Log
  return collections
}

// Export the raw collections array again
export { collections }

// // Extracts slugs from the imported collection configurations - Moved to where it's needed
// export const availableCollectionsSlugs = collections.map((col) => col.slug)

// Optional: Export specific groups of slugs if needed
// export const pageLikeSlugs = collections
//   .filter(col => col.admin?.useAsTitle)
//   .map(col => col.slug);
