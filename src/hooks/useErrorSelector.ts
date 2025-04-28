'use client'

import { useContext } from 'react'
import { ErrorContext } from '@/providers/ErrorProvider'
import type {
  AppError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContextType,
} from '@/providers/ErrorProvider'

/**
 * Custom hook to select specific parts of the error context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 *
 * @param selector A function that selects specific parts of the error context
 * @returns The selected parts of the error context
 */
export function useErrorSelector<T>(selector: (context: ErrorContextType) => T): T {
  const context = useContext(ErrorContext)

  if (context === undefined) {
    throw new Error('useErrorSelector must be used within an ErrorProvider')
  }

  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the error state
 */
export function useErrorState() {
  return useErrorSelector((context) => ({
    errors: context.errors,
    lastError: context.lastError,
    hasErrors: context.errors.length > 0,
    errorCount: context.errors.length,
  }))
}

/**
 * Select only the error capture functionality
 */
export function useErrorCapture() {
  return useErrorSelector((context) => ({
    captureError: context.captureError,
    handleErrorBoundary: context.handleErrorBoundary,
  }))
}

/**
 * Select only the error management functionality
 */
export function useErrorManagement() {
  return useErrorSelector((context) => ({
    markErrorAsHandled: context.markErrorAsHandled,
    clearError: context.clearError,
    clearAllErrors: context.clearAllErrors,
    reportError: context.reportError,
    recoverFromError: context.recoverFromError,
  }))
}

/**
 * Get errors by severity
 */
export function useErrorsBySeverity(severity: ErrorSeverity) {
  return useErrorSelector((context) => ({
    errors: context.errors.filter((error: AppError) => error.severity === severity),
    count: context.errors.filter((error: AppError) => error.severity === severity).length,
  }))
}

/**
 * Get errors by category
 */
export function useErrorsByCategory(category: ErrorCategory) {
  return useErrorSelector((context) => ({
    errors: context.errors.filter((error: AppError) => error.category === category),
    count: context.errors.filter((error: AppError) => error.category === category).length,
  }))
}

/**
 * Create a try-catch wrapper with error handling
 */
export function useTryCatch() {
  const { captureError } = useErrorCapture()

  return async <T>(
    fn: () => Promise<T> | T,
    options?: {
      severity?: ErrorSeverity
      category?: ErrorCategory
      context?: Record<string, any>
      silent?: boolean
      onError?: (error: Error) => void
    },
  ): Promise<[T | null, Error | null]> => {
    try {
      const result = await fn()
      return [result, null]
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))

      captureError(err, {
        severity: options?.severity || 'error',
        category: options?.category || 'unknown',
        context: options?.context,
        silent: options?.silent,
      })

      if (options?.onError) {
        options.onError(err)
      }

      return [null, err]
    }
  }
}
