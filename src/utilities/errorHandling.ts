interface PriceErrorDetails {
  code?: string;
  timestamp?: number;
  context?: Record<string, unknown>;
}

export class PriceError extends Error {
  constructor(message: string, public details?: PriceErrorDetails) {
    super(message)
    this.name = 'PriceError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export const handlePriceError = (error: unknown): never => {
  if (error instanceof PriceError) {
    console.error('Price processing error:', error.message, error.details)
    // Transform to application error
    throw new Error(`Price processing failed: ${error.message}`)
  }
  throw error instanceof Error ? error : new Error(String(error))
}
