'use client'

import React, { createContext, useContext, useCallback, ReactNode, useEffect } from 'react'
import { LRUCache } from 'lru-cache'
import { memoryManager } from '@/utilities/memoryManager'

// Define cache entry type
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Use LRU cache instead of plain object for better memory management
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new LRUCache<string, CacheEntry<any>>({
  max: 100, // Maximum 100 entries
  ttl: 5 * 60 * 1000, // 5 minutes TTL
  maxSize: 10 * 1024 * 1024, // 10MB max cache size
  sizeCalculation: (value) => {
    // Estimate object size in bytes
    return JSON.stringify(value).length * 2
  },
  dispose: (value, _key) => {
    // Cleanup any references
    if (value && typeof value === 'object') {
      Object.keys(value).forEach((k) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(value as any)[k] = null
      })
    }
  },
})

// Регистрируем кэш в менеджере памяти
memoryManager.registerCache(cache)

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
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Unregister cache from memory manager when component unmounts
      memoryManager.unregisterCache(cache)
    }
  }, [])

  // Get data from cache
  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache.get(key)

    // If entry doesn't exist or is expired, return null
    if (!entry || entry.expiresAt < Date.now()) {
      cache.delete(key) // Clean up expired entries
      return null
    }

    return entry.data as T
  }, [])

  // Set data in cache
  const set = useCallback(
    <T,>(key: string, data: T, expirationMs: number = DEFAULT_CACHE_EXPIRATION): void => {
      const now = Date.now()

      cache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + expirationMs,
      })
    },
    [],
  )

  // Remove data from cache
  const remove = useCallback((key: string): void => {
    cache.delete(key)
  }, [])

  // Clear entire cache or by pattern
  const clear = useCallback((pattern?: string): void => {
    if (!pattern) {
      // Clear entire cache
      cache.clear()
      return
    }

    // Clear by pattern
    const regex = new RegExp(pattern)

    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key)
      }
    }
  }, [])

  // Check if key exists and is not expired
  const has = useCallback((key: string): boolean => {
    const entry = cache.get(key)
    return !!entry && entry.expiresAt > Date.now()
  }, [])

  // Invalidate cache entries by pattern
  const invalidate = useCallback((pattern: string): void => {
    const regex = new RegExp(pattern)

    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key)
      }
    }
  }, [])

  const value = {
    get,
    set,
    remove,
    clear,
    has,
    invalidate,
  }

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
}

export function useCache() {
  const context = useContext(CacheContext)
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider')
  }
  return context
}
