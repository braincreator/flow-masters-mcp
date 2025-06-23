import type { Payload } from 'payload'
import type { ServiceQueryOptions } from '@/types/service' // Changed from ServiceOptions

import { logger } from '@/utilities/logger'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// import { ErrorHandler } from '@/utilities/errorHandling' // Removed unused import
// import { ServiceRegistry } from './service.registry' // Remove top-level import

export abstract class BaseService {
  protected payload: Payload
  protected serviceRegistry: import('./service.registry').ServiceRegistry | null = null // Use import type

  constructor(payload: Payload) {
    this.payload = payload
  }

  protected async getServiceRegistry(): Promise<import('./service.registry').ServiceRegistry> { // Make async
    if (!this.serviceRegistry) {
      // Dynamically import ServiceRegistry only when needed
      const { ServiceRegistry } = await import('./service.registry')
      this.serviceRegistry = ServiceRegistry.getInstance(this.payload);
    }
    return this.serviceRegistry
  }

  protected async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      logError(errorMessage, error)
      throw error
    }
  }
}
