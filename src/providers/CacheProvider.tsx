'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Define cache entry type
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Define cache type
interface Cache {
  [key: string]: CacheEntry<any>
}

export interface CacheContextType {
  // Get data from cache
  get: <T>(key: string) => T | null
  // Set data in cache with optional expiration
  set: <T>(key: string, data: T, expirationMs?: number) => void
  // Remove data from cache
  remove: (key: string) => void
  // Clear entire cache or by pattern
  clear: (pattern?: string) => void
  // Check if key exists and is not expired
  has: (key: string) => boolean
  // Invalidate cache entries by pattern
  invalidate: (pattern: string) => void
}

const CacheContext = createContext<CacheContextType | undefined>(undefined)

// Default cache expiration: 5 minutes
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Cache>({})

  // Get data from cache
  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache[key]
    
    // If entry doesn't exist or is expired, return null
    if (!entry || entry.expiresAt < Date.now()) {
      return null
    }
    
    return entry.data as T
  }, [cache])

  // Set data in cache
  const set = useCallback(<T,>(key: string, data: T, expirationMs: number = DEFAULT_CACHE_EXPIRATION): void => {
    const now = Date.now()
    
    setCache(prevCache => ({
      ...prevCache,
      [key]: {
        data,
        timestamp: now,
        expiresAt: now + expirationMs
      }
    }))
  }, [])

  // Remove data from cache
  const remove = useCallback((key: string): void => {
    setCache(prevCache => {
      const newCache = { ...prevCache }
      delete newCache[key]
      return newCache
    })
  }, [])

  // Clear entire cache or by pattern
  const clear = useCallback((pattern?: string): void => {
    if (!pattern) {
      // Clear entire cache
      setCache({})
      return
    }
    
    // Clear by pattern
    const regex = new RegExp(pattern)
    
    setCache(prevCache => {
      const newCache = { ...prevCache }
      
      Object.keys(newCache).forEach(key => {
        if (regex.test(key)) {
          delete newCache[key]
        }
      })
      
      return newCache
    })
  }, [])

  // Check if key exists and is not expired
  const has = useCallback((key: string): boolean => {
    const entry = cache[key]
    return !!entry && entry.expiresAt > Date.now()
  }, [cache])

  // Invalidate cache entries by pattern
  const invalidate = useCallback((pattern: string): void => {
    const regex = new RegExp(pattern)
    
    setCache(prevCache => {
      const newCache = { ...prevCache }
      
      Object.keys(newCache).forEach(key => {
        if (regex.test(key)) {
          delete newCache[key]
        }
      })
      
      return newCache
    })
  }, [])

  const value = {
    get,
    set,
    remove,
    clear,
    has,
    invalidate
  }

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const context = useContext(CacheContext)
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider')
  }
  return context
}
