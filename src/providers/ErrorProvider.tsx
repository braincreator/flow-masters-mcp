'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

// Define error categories
export type ErrorCategory =
  | 'api'
  | 'auth'
  | 'network'
  | 'validation'
  | 'permission'
  | 'navigation'
  | 'rendering'
  | 'unknown'

// Define error object
export interface AppError {
  id: string
  message: string
  code?: string
  severity: ErrorSeverity
  category: ErrorCategory
  timestamp: Date
  context?: Record<string, any>
  originalError?: Error
  handled: boolean
  stack?: string
  componentStack?: string
}

// Define error context
export interface ErrorContextType {
  // Error state
  errors: AppError[]
  lastError: AppError | null

  // Error handling
  captureError: (
    error: Error | string,
    options?: {
      severity?: ErrorSeverity
      category?: ErrorCategory
      code?: string
      context?: Record<string, any>
      silent?: boolean
    },
  ) => string // Returns error ID

  markErrorAsHandled: (errorId: string) => void
  clearError: (errorId: string) => void
  clearAllErrors: () => void

  // Error reporting
  reportError: (errorId: string) => void

  // Error recovery
  recoverFromError: (errorId: string, recoveryAction?: () => void) => void

  // Error boundary methods
  handleErrorBoundary: (error: Error, componentStack: string) => void
}

// Create context
export const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

// Provider props
interface ErrorProviderProps {
  children: ReactNode
  reportingEndpoint?: string
  showToasts?: boolean
  logToConsole?: boolean
}

// Provider component
export function ErrorProvider({
  children,
  reportingEndpoint,
  showToasts = true,
  logToConsole = true,
}: ErrorProviderProps) {
  const [errors, setErrors] = useState<AppError[]>([])
  const router = useRouter()

  // Get the last error
  const lastError = useMemo(() => (errors.length > 0 ? errors[errors.length - 1] : null), [errors])

  // Generate a unique error ID
  const generateErrorId = useCallback(() => {
    return `error-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }, [])

  // Capture an error
  const captureError = useCallback(
    (
      error: Error | string,
      options?: {
        severity?: ErrorSeverity
        category?: ErrorCategory
        code?: string
        context?: Record<string, any>
        silent?: boolean
      },
    ): string => {
      const errorId = generateErrorId()
      const message = typeof error === 'string' ? error : error.message
      const severity = options?.severity || 'error'
      const category = options?.category || 'unknown'
      const timestamp = new Date()
      const originalError = typeof error === 'string' ? undefined : error
      const stack = originalError?.stack

      const appError: AppError = {
        id: errorId,
        message,
        code: options?.code,
        severity,
        category,
        timestamp,
        context: options?.context,
        originalError,
        stack,
        handled: false,
      }

      setErrors((prev) => [...prev, appError])

      // Log to console
      if (logToConsole) {
        logError(`[${severity.toUpperCase()}] ${category}: ${message}`, {
          errorId,
          code: options?.code,
          context: options?.context,
          originalError,
        })
      }

      // Show toast notification
      if (showToasts && !options?.silent) {
        switch (severity) {
          case 'info':
            toast.info(message, {
              id: errorId,
              description: options?.code,
            })
            break
          case 'warning':
            toast.warning(message, {
              id: errorId,
              description: options?.code,
            })
            break
          case 'error':
          case 'critical':
            toast.error(message, {
              id: errorId,
              description: options?.code,
            })
            break
        }
      }

      return errorId
    },
    [generateErrorId, logToConsole, showToasts],
  )

  // Mark an error as handled
  const markErrorAsHandled = useCallback((errorId: string) => {
    setErrors((prev) =>
      prev.map((error) => (error.id === errorId ? { ...error, handled: true } : error)),
    )
  }, [])

  // Clear a specific error
  const clearError = useCallback((errorId: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId))
  }, [])

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  // Report an error to the server
  const reportError = useCallback(
    async (errorId: string) => {
      const error = errors.find((e) => e.id === errorId)

      if (!error || !reportingEndpoint) return

      try {
        await fetch(reportingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: error.id,
            message: error.message,
            code: error.code,
            severity: error.severity,
            category: error.category,
            timestamp: error.timestamp,
            context: error.context,
            stack: error.stack,
            componentStack: error.componentStack,
          }),
        })
      } catch (err) {
        logError('Failed to report error:', err)
      }
    },
    [errors, reportingEndpoint],
  )

  // Recover from an error
  const recoverFromError = useCallback(
    (errorId: string, recoveryAction?: () => void) => {
      const error = errors.find((e) => e.id === errorId)

      if (!error) return

      // Mark as handled
      markErrorAsHandled(errorId)

      // Execute recovery action if provided
      if (recoveryAction) {
        try {
          recoveryAction()
        } catch (err) {
          captureError(err as Error, {
            severity: 'error',
            category: 'unknown',
            context: { recoveryAttempt: true, originalErrorId: errorId },
          })
        }
      } else {
        // Default recovery actions based on category
        switch (error.category) {
          case 'network':
            // Retry the request or reload the page
            window.location.reload()
            break
          case 'navigation':
            // Navigate to a safe page
            router.push('/')
            break
          case 'auth':
          case 'permission': // Added 'permission' category to redirect to login
            // Redirect to login
            router.push('/login')
            break
          default:
            // Explicitly handle 403 if it reaches here and wasn't categorized as 'permission' or 'auth'
            if (error.code === '403') {
              router.push('/login')
            } else {
              // No default recovery action for other uncategorized errors to prevent loops
              logWarn(
                `No default recovery action for error: ${error.id}, category: ${error.category}, code: ${error.code}`,
              )
            }
            break
        }
      }
    },
    [errors, markErrorAsHandled, captureError, router],
  )

  // Handle errors from error boundaries
  const handleErrorBoundary = useCallback(
    (error: Error, componentStack: string) => {
      captureError(error, {
        severity: 'critical',
        category: 'rendering',
        context: { componentStack },
      })
    },
    [captureError],
  )

  // Global error handler for uncaught errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      captureError(event.error || event.message, {
        severity: 'critical',
        category: 'unknown',
        context: { source: 'window.onerror' },
      })

      // Prevent default browser error handling
      event.preventDefault()
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureError(event.reason || 'Unhandled Promise Rejection', {
        severity: 'critical',
        category: 'unknown',
        context: { source: 'unhandledrejection' },
      })

      // Prevent default browser error handling
      event.preventDefault()
    }

    // Add event listeners
    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [captureError])

  // Memoize context value
  const value = useMemo(
    () => ({
      errors,
      lastError,
      captureError,
      markErrorAsHandled,
      clearError,
      clearAllErrors,
      reportError,
      recoverFromError,
      handleErrorBoundary,
    }),
    [
      errors,
      lastError,
      captureError,
      markErrorAsHandled,
      clearError,
      clearAllErrors,
      reportError,
      recoverFromError,
      handleErrorBoundary,
    ],
  )

  return <ErrorContext.Provider value={value as ErrorContextType}>{children}</ErrorContext.Provider>
}

// Custom hook to use the error context
export function useError() {
  const context = useContext(ErrorContext)

  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }

  return context
}

// Error boundary component
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: AppError, reset: () => void) => ReactNode)
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static override contextType = ErrorContext
  declare context: React.ContextType<typeof ErrorContext>

  override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    if (this.context) {
      this.context.handleErrorBoundary(error, errorInfo.componentStack || '')
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  override render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      const errorId = `boundary-${Date.now()}`
      const appError: AppError = {
        id: errorId,
        message: error.message,
        severity: 'critical',
        category: 'rendering',
        timestamp: new Date(),
        originalError: error,
        stack: error.stack,
        componentStack: this.state.errorInfo?.componentStack || undefined,
        handled: true,
      }

      if (typeof fallback === 'function') {
        return fallback(appError, this.reset)
      }

      return (
        fallback || (
          <div className="p-4 border border-red-500 rounded bg-red-50 text-red-800">
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="mb-4">{error.message}</p>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={this.reset}
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return children
  }
}
