// State change logging levels
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

// Configuration for state logger
interface StateLoggerConfig {
  // Current log level
  level: LogLevel
  // Whether to include timestamps
  timestamps: boolean
  // Whether to include component name
  componentName: boolean
  // Whether to log to console
  console: boolean
  // Whether to persist logs
  persist: boolean
  // Maximum number of logs to keep in memory
  maxLogs: number
  // Whether to group related logs
  groupLogs: boolean
  // Whether to log in production
  logInProduction: boolean
}

// Default configuration
const DEFAULT_CONFIG: StateLoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.INFO,
  timestamps: true,
  componentName: true,
  console: true,
  persist: false,
  maxLogs: 100,
  groupLogs: true,
  logInProduction: false,
}

// Log entry structure
interface LogEntry {
  timestamp: number
  level: LogLevel
  component: string
  action: string
  prevState?: any
  nextState?: any
  payload?: any
  metadata?: Record<string, any>
}

class StateLogger {
  private config: StateLoggerConfig
  private logs: LogEntry[] = []
  private static instance: StateLogger

  private constructor(config: Partial<StateLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    // Don't log in production unless explicitly enabled
    if (process.env.NODE_ENV === 'production' && !this.config.logInProduction) {
      this.config.level = LogLevel.NONE
      this.config.console = false
      this.config.persist = false
    }
  }

  // Get singleton instance
  public static getInstance(config?: Partial<StateLoggerConfig>): StateLogger {
    if (!StateLogger.instance) {
      StateLogger.instance = new StateLogger(config)
    } else if (config) {
      // Update config if provided
      StateLogger.instance.config = { ...StateLogger.instance.config, ...config }
    }
    
    return StateLogger.instance
  }

  // Update configuration
  public configure(config: Partial<StateLoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Log state change
  public logStateChange(
    level: LogLevel,
    component: string,
    action: string,
    prevState?: any,
    nextState?: any,
    payload?: any,
    metadata?: Record<string, any>
  ): void {
    // Skip if log level is higher than configured level
    if (level > this.config.level) return
    
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      component,
      action,
      prevState,
      nextState,
      payload,
      metadata,
    }
    
    // Add to in-memory logs if persistence is enabled
    if (this.config.persist) {
      this.logs.push(logEntry)
      
      // Trim logs if exceeding max
      if (this.logs.length > this.config.maxLogs) {
        this.logs = this.logs.slice(-this.config.maxLogs)
      }
    }
    
    // Log to console if enabled
    if (this.config.console) {
      this.logToConsole(logEntry)
    }
  }

  // Helper methods for different log levels
  public trace(
    component: string,
    action: string,
    prevState?: any,
    nextState?: any,
    payload?: any,
    metadata?: Record<string, any>
  ): void {
    this.logStateChange(LogLevel.TRACE, component, action, prevState, nextState, payload, metadata)
  }

  public debug(
    component: string,
    action: string,
    prevState?: any,
    nextState?: any,
    payload?: any,
    metadata?: Record<string, any>
  ): void {
    this.logStateChange(LogLevel.DEBUG, component, action, prevState, nextState, payload, metadata)
  }

  public info(
    component: string,
    action: string,
    prevState?: any,
    nextState?: any,
    payload?: any,
    metadata?: Record<string, any>
  ): void {
    this.logStateChange(LogLevel.INFO, component, action, prevState, nextState, payload, metadata)
  }

  public warn(
    component: string,
    action: string,
    prevState?: any,
    nextState?: any,
    payload?: any,
    metadata?: Record<string, any>
  ): void {
    this.logStateChange(LogLevel.WARN, component, action, prevState, nextState, payload, metadata)
  }

  public error(
    component: string,
    action: string,
    prevState?: any,
    nextState?: any,
    payload?: any,
    metadata?: Record<string, any>
  ): void {
    this.logStateChange(LogLevel.ERROR, component, action, prevState, nextState, payload, metadata)
  }

  // Get all logs
  public getLogs(): LogEntry[] {
    return [...this.logs]
  }

  // Clear logs
  public clearLogs(): void {
    this.logs = []
  }

  // Export logs as JSON
  public exportLogs(): string {
    return JSON.stringify(this.logs)
  }

  // Private method to log to console
  private logToConsole(logEntry: LogEntry): void {
    const { timestamp, level, component, action, prevState, nextState, payload, metadata } = logEntry
    
    // Format timestamp if enabled
    const timestampStr = this.config.timestamps
      ? `[${new Date(timestamp).toISOString()}] `
      : ''
    
    // Format component name if enabled
    const componentStr = this.config.componentName ? `[${component}] ` : ''
    
    // Create log message
    const message = `${timestampStr}${componentStr}${action}`
    
    // Determine log method based on level
    let logMethod: (...args: any[]) => void
    let logColor: string
    
    switch (level) {
      case LogLevel.ERROR:
        logMethod = console.error
        logColor = 'color: #ff5252; font-weight: bold'
        break
      case LogLevel.WARN:
        logMethod = console.warn
        logColor = 'color: #fb8c00; font-weight: bold'
        break
      case LogLevel.INFO:
        logMethod = console.info
        logColor = 'color: #2196f3'
        break
      case LogLevel.DEBUG:
        logMethod = console.debug
        logColor = 'color: #4caf50'
        break
      case LogLevel.TRACE:
        logMethod = console.debug
        logColor = 'color: #9e9e9e'
        break
      default:
        logMethod = console.log
        logColor = 'color: inherit'
    }
    
    // Group logs if enabled
    if (this.config.groupLogs) {
      console.groupCollapsed(`%c${message}`, logColor)
      
      if (prevState !== undefined) {
        logDebug('%cPrevious State:', 'color: #9e9e9e; font-weight: bold', prevState)
      }
      
      if (nextState !== undefined) {
        logDebug('%cNext State:', 'color: #4caf50; font-weight: bold', nextState)
      }
      
      if (payload !== undefined) {
        logDebug('%cPayload:', 'color: #ff9800; font-weight: bold', payload)
      }
      
      if (metadata !== undefined) {
        logDebug('%cMetadata:', 'color: #9c27b0; font-weight: bold', metadata)
      }
      
      console.groupEnd()
    } else {
      // Simple logging without grouping
      logMethod(
        `%c${message}`,
        logColor,
        prevState !== undefined ? { prevState } : '',
        nextState !== undefined ? { nextState } : '',
        payload !== undefined ? { payload } : '',
        metadata !== undefined ? { metadata } : ''
      )
    }
  }
}

// Export singleton instance
export const stateLogger = StateLogger.getInstance()

import { useCallback, useMemo } from 'react';

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Create a hook for logging state changes in React components
export function useStateLogger(componentName: string) {
  const trace = useCallback(
    (action: string, prevState?: any, nextState?: any, payload?: any, metadata?: Record<string, any>) =>
      stateLogger.trace(componentName, action, prevState, nextState, payload, metadata),
    [componentName],
  );
  const debug = useCallback(
    (action: string, prevState?: any, nextState?: any, payload?: any, metadata?: Record<string, any>) =>
      stateLogger.debug(componentName, action, prevState, nextState, payload, metadata),
    [componentName],
  );
  const info = useCallback(
    (action: string, prevState?: any, nextState?: any, payload?: any, metadata?: Record<string, any>) =>
      stateLogger.info(componentName, action, prevState, nextState, payload, metadata),
    [componentName],
  );
  const warn = useCallback(
    (action: string, prevState?: any, nextState?: any, payload?: any, metadata?: Record<string, any>) =>
      stateLogger.warn(componentName, action, prevState, nextState, payload, metadata),
    [componentName],
  );
  const error = useCallback(
    (action: string, prevState?: any, nextState?: any, payload?: any, metadata?: Record<string, any>) =>
      stateLogger.error(componentName, action, prevState, nextState, payload, metadata),
    [componentName],
  );

  return useMemo(
    () => ({
      trace,
      debug,
      info,
      warn,
      error,
    }),
    [trace, debug, info, warn, error],
  );
}
