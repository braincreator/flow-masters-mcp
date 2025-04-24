import { logger } from './logger'

/**
 * Cleans up Payload CMS connections
 * This function is called during application shutdown
 */
export async function cleanupPayloadConnections(): Promise<void> {
  try {
    // Check if global.payloadClient exists
    if (global.payloadClient) {
      logger.info('Cleaning up Payload connections')
      
      // Use the destroy method if it exists
      if (typeof global.payloadClient.db?.destroy === 'function') {
        await global.payloadClient.db.destroy()
        logger.info('Successfully destroyed Payload database connection')
      }
      
      // Reset the global client
      global.payloadClient = null
    }
  } catch (error) {
    logger.error('Error cleaning up Payload connections:', error)
  }
}
