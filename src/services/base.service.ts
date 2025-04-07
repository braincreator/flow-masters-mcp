import type { Payload } from 'payload'
import type { ServiceOptions } from '@/types/service'

import { logger } from '@/utilities/logger'
import { ErrorHandler } from '@/utilities/errorHandler'
import { ServiceRegistry } from './service.registry'

export abstract class BaseService {
  protected payload: Payload
  protected serviceRegistry: ServiceRegistry | null = null

  constructor(payload: Payload) {
    this.payload = payload
  }

  protected getServiceRegistry(): ServiceRegistry {
    if (!this.serviceRegistry) {
      this.serviceRegistry = ServiceRegistry.getInstance(this.payload)
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
      console.error(errorMessage, error)
      throw error
    }
  }
}
