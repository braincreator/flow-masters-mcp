/**
 * Centralized logging system for FlowMasters
 * Replaces console.log with conditional logging based on environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  userId?: string
  action?: string
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isClient = typeof window !== 'undefined'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    if (context?.component) {
      return `${prefix} [${context.component}] ${message}`
    }
    
    return `${prefix} ${message}`
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors and warnings
    if (level === 'error' || level === 'warn') return true
    
    // Only log debug and info in development
    return this.isDevelopment
  }

  private logToConsole(level: LogLevel, message: string, data?: any, context?: LogContext) {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, context)

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '')
        break
      case 'info':
        console.info(formattedMessage, data || '')
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'error':
        console.error(formattedMessage, data || '')
        break
    }

    // Log context metadata if provided
    if (context?.metadata && this.isDevelopment) {
      console.debug('Context:', context.metadata)
    }
  }

  debug(message: string, data?: any, context?: LogContext) {
    this.logToConsole('debug', message, data, context)
  }

  info(message: string, data?: any, context?: LogContext) {
    this.logToConsole('info', message, data, context)
  }

  warn(message: string, data?: any, context?: LogContext) {
    this.logToConsole('warn', message, data, context)
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    this.logToConsole('error', message, error, context)
    
    // In production, you might want to send errors to a logging service
    if (!this.isDevelopment && this.isClient) {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      // this.sendToErrorService(message, error, context)
    }
  }

  // Convenience method for API logging
  api(method: string, url: string, status?: number, duration?: number, context?: LogContext) {
    const message = `${method} ${url} ${status ? `- ${status}` : ''} ${duration ? `(${duration}ms)` : ''}`
    
    if (status && status >= 400) {
      this.error(message, undefined, { ...context, component: 'API' })
    } else {
      this.info(message, undefined, { ...context, component: 'API' })
    }
  }

  // Convenience method for component logging
  component(componentName: string, action: string, data?: any) {
    this.debug(`${action}`, data, { component: componentName })
  }

  // Performance logging
  performance(label: string, duration: number, context?: LogContext) {
    if (duration > 1000) {
      this.warn(`Performance: ${label} took ${duration}ms`, undefined, context)
    } else {
      this.debug(`Performance: ${label} took ${duration}ms`, undefined, context)
    }
  }

  // User action logging
  userAction(action: string, userId?: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action}`, undefined, {
      userId,
      action,
      metadata
    })
  }
}

// Create singleton instance
export const logger = new Logger()

// Convenience exports
export const logDebug = logger.debug.bind(logger)
export const logInfo = logger.info.bind(logger)
export const logWarn = logger.warn.bind(logger)
export const logError = logger.error.bind(logger)
export const logApi = logger.api.bind(logger)
export const logComponent = logger.component.bind(logger)
export const logPerformance = logger.performance.bind(logger)
export const logUserAction = logger.userAction.bind(logger)

// Development-only console replacement
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

export default logger
