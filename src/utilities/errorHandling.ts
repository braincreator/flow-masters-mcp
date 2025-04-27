import { toast } from '@/components/ui/use-toast'

// Error types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
  PRICE = 'price',
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Enhanced error class
export class AppError extends Error {
  type: ErrorType
  severity: ErrorSeverity
  originalError?: Error | unknown
  statusCode?: number
  context?: Record<string, any>

  constructor({
    message,
    type = ErrorType.UNKNOWN,
    severity = ErrorSeverity.ERROR,
    originalError,
    statusCode,
    context,
  }: {
    message: string
    type?: ErrorType
    severity?: ErrorSeverity
    originalError?: Error | unknown
    statusCode?: number
    context?: Record<string, any>
  }) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.originalError = originalError
    this.statusCode = statusCode
    this.context = context
  }

  // Get user-friendly message based on error type and severity
  getUserMessage(): string {
    // Default messages by type
    const defaultMessages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Network connection issue. Please check your internet connection.',
      [ErrorType.AUTHENTICATION]: 'Authentication required. Please log in to continue.',
      [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorType.VALIDATION]: 'Please check your input and try again.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.SERVER]: 'Server error. Our team has been notified.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again later.',
      [ErrorType.PRICE]: 'Price processing failed. Please try again later.',
    }

    return this.message || defaultMessages[this.type]
  }

  // Log error with appropriate level
  log(): void {
    const errorInfo = {
      message: this.message,
      type: this.type,
      severity: this.severity,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack,
      originalError:
        this.originalError instanceof Error
          ? {
              message: this.originalError.message,
              stack: this.originalError.stack,
            }
          : this.originalError,
    }

    switch (this.severity) {
      case ErrorSeverity.INFO:
        console.info('App Error (INFO):', errorInfo)
        break
      case ErrorSeverity.WARNING:
        console.warn('App Error (WARNING):', errorInfo)
        break
      case ErrorSeverity.CRITICAL:
        console.error('App Error (CRITICAL):', errorInfo)
        // Here you could add additional reporting for critical errors
        // e.g., send to error monitoring service
        break
      case ErrorSeverity.ERROR:
      default:
        console.error('App Error:', errorInfo)
        break
    }
  }

  // Show toast notification for this error
  notify(options?: { title?: string; duration?: number }): void {
    const { title, duration } = options || {}

    // Determine variant based on severity
    let variant: 'default' | 'destructive' = 'default'
    if (this.severity === ErrorSeverity.ERROR || this.severity === ErrorSeverity.CRITICAL) {
      variant = 'destructive'
    }

    toast({
      title: title || this.type.charAt(0).toUpperCase() + this.type.slice(1) + ' Error',
      description: this.getUserMessage(),
      variant,
      duration: duration || 5000,
    })
  }
}

// Helper function to create AppError from any error
export function createAppError(
  error: unknown,
  defaultMessage = 'An unexpected error occurred',
): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError({
      message: error.message,
      originalError: error,
    })
  }

  if (typeof error === 'string') {
    return new AppError({
      message: error,
    })
  }

  return new AppError({
    message: defaultMessage,
    originalError: error,
  })
}

// Helper function to handle API errors
export function handleApiError(error: unknown, context?: Record<string, any>): AppError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError({
      message: 'Network connection issue. Please check your internet connection.',
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.WARNING,
      originalError: error,
      context,
    })
  }

  // Handle response errors
  if (error instanceof Response || (error && typeof error === 'object' && 'status' in error)) {
    const response = error as Response
    const statusCode = response.status

    switch (true) {
      case statusCode === 401:
        return new AppError({
          message: 'Authentication required. Please log in to continue.',
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.WARNING,
          statusCode,
          originalError: error,
          context,
        })

      case statusCode === 403:
        return new AppError({
          message: 'You do not have permission to perform this action.',
          type: ErrorType.AUTHORIZATION,
          severity: ErrorSeverity.WARNING,
          statusCode,
          originalError: error,
          context,
        })

      case statusCode === 404:
        return new AppError({
          message: 'The requested resource was not found.',
          type: ErrorType.NOT_FOUND,
          severity: ErrorSeverity.WARNING,
          statusCode,
          originalError: error,
          context,
        })

      case statusCode >= 400 && statusCode < 500:
        return new AppError({
          message: 'Invalid request. Please check your input and try again.',
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.WARNING,
          statusCode,
          originalError: error,
          context,
        })

      case statusCode >= 500:
        return new AppError({
          message: 'Server error. Our team has been notified.',
          type: ErrorType.SERVER,
          severity: ErrorSeverity.ERROR,
          statusCode,
          originalError: error,
          context,
        })

      default:
        return createAppError(error)
    }
  }

  return createAppError(error)
}

// Async error handler for try/catch blocks
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: AppError) => void,
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (error) {
    const appError = createAppError(error)
    appError.log()

    if (errorHandler) {
      errorHandler(appError)
    }

    return { data: null, error: appError }
  }
}

// Legacy price error handling for backward compatibility
interface PriceErrorDetails {
  code?: string
  timestamp?: number
  context?: Record<string, unknown>
}

export class PriceError extends Error {
  constructor(
    message: string,
    public details?: PriceErrorDetails,
  ) {
    super(message)
    this.name = 'PriceError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export const handlePriceError = (error: unknown): never => {
  if (error instanceof PriceError) {
    console.error('Price processing error:', error.message, error.details)

    // Transform to application error
    const appError = new AppError({
      message: `Price processing failed: ${error.message}`,
      type: ErrorType.PRICE,
      severity: ErrorSeverity.ERROR,
      originalError: error,
      context: error.details,
    })

    appError.log()
    throw appError
  }

  const appError = createAppError(error)
  appError.log()
  throw appError
}
