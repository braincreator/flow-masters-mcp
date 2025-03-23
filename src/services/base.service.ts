import type { Payload } from 'payload'
import type { ServiceOptions } from '@/types/service'

import { logger } from '@/utilities/logger'
import { ErrorHandler } from '@/utilities/errorHandler'

export abstract class BaseService {
  protected payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  protected async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      console.error(errorMessage, error)
      throw error
    }
  }
}
