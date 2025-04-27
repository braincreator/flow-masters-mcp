'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useError } from '@/providers/ErrorProvider'

// Define feature flag types
export interface FeatureFlag {
  id: string
  name: string
  description?: string
  enabled: boolean
  userGroups?: string[]
  userIds?: string[]
  percentage?: number
  startDate?: string
  endDate?: string
  dependencies?: string[]
  variants?: FeatureVariant[]
  metadata?: Record<string, any>
}

export interface FeatureVariant {
  id: string
  name: string
  weight: number
  metadata?: Record<string, any>
}

// Define feature flags context
interface FeatureFlagsContextType {
  // Feature flag state
  flags: Record<string, boolean>
  variants: Record<string, string>
  isLoading: boolean
  error: Error | null
  
  // Feature flag methods
  isFeatureEnabled: (featureId: string) => boolean
  getFeatureVariant: (featureId: string) => string | null
  getFeatureMetadata: (featureId: string) => Record<string, any> | null
  refreshFlags: () => Promise<void>
  
  // Component helpers
  FeatureFlag: React.FC<{
    feature: string
    fallback?: React.ReactNode
    children: React.ReactNode
  }>
  
  FeatureVariant: React.FC<{
    feature: string
    variant: string
    fallback?: React.ReactNode
    children: React.ReactNode
  }>
}

// Create context
const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined)

// Provider props
interface FeatureFlagsProviderProps {
  children: ReactNode
  initialFlags?: FeatureFlag[]
  apiEndpoint?: string
  localStorageKey?: string
  refreshInterval?: number
}

// Helper function to generate a consistent hash from a string
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash % 100)
}

// Provider component
export function FeatureFlagsProvider({
  children,
  initialFlags = [],
  apiEndpoint = '/api/feature-flags',
  localStorageKey = 'feature-flags',
  refreshInterval = 0, // 0 means no auto-refresh
}: FeatureFlagsProviderProps) {
  const { user } = useAuth()
  const { captureError } = useError()
  
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(initialFlags)
  const [isLoading, setIsLoading] = useState(initialFlags.length === 0)
  const [error, setError] = useState<Error | null>(null)
  
  // Fetch feature flags from API
  const fetchFlags = useCallback(async () => {
    if (!apiEndpoint) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(apiEndpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feature flags: ${response.status}`)
      }
      
      const data = await response.json()
      setFeatureFlags(data.flags || [])
      
      // Cache flags in localStorage if key is provided
      if (localStorageKey && typeof window !== 'undefined') {
        localStorage.setItem(localStorageKey, JSON.stringify({
          flags: data.flags,
          timestamp: Date.now(),
        }))
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      captureError(error, {
        severity: 'warning',
        category: 'api',
        context: { source: 'FeatureFlagsProvider.fetchFlags' },
      })
      
      // Try to load from localStorage if available
      if (localStorageKey && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(localStorageKey)
          if (cached) {
            const { flags, timestamp } = JSON.parse(cached)
            // Only use cached flags if they're less than 1 hour old
            if (Date.now() - timestamp < 3600000) {
              setFeatureFlags(flags)
            }
          }
        } catch (cacheErr) {
          console.error('Failed to load cached feature flags:', cacheErr)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [apiEndpoint, captureError, localStorageKey])
  
  // Process flags based on user, percentage rollout, etc.
  const processedFlags = useMemo(() => {
    const result: Record<string, boolean> = {}
    const variantResult: Record<string, string> = {}
    const metadataResult: Record<string, Record<string, any>> = {}
    
    // Helper to check if a flag's dependencies are met
    const areDependenciesMet = (flag: FeatureFlag): boolean => {
      if (!flag.dependencies || flag.dependencies.length === 0) return true
      
      return flag.dependencies.every(depId => result[depId])
    }
    
    // Helper to check if a flag is within its date range
    const isWithinDateRange = (flag: FeatureFlag): boolean => {
      const now = new Date()
      
      if (flag.startDate && new Date(flag.startDate) > now) return false
      if (flag.endDate && new Date(flag.endDate) < now) return false
      
      return true
    }
    
    // Helper to check if a user is in the target group
    const isUserTargeted = (flag: FeatureFlag): boolean => {
      // If no user, only enable flags without user targeting
      if (!user) {
        return !flag.userGroups && !flag.userIds
      }
      
      // Check user ID targeting
      if (flag.userIds && flag.userIds.includes(user.id)) {
        return true
      }
      
      // Check user group targeting
      if (flag.userGroups && user.role && flag.userGroups.includes(user.role)) {
        return true
      }
      
      // If user targeting is specified but user doesn't match, return false
      if ((flag.userIds && flag.userIds.length > 0) || 
          (flag.userGroups && flag.userGroups.length > 0)) {
        return false
      }
      
      return true
    }
    
    // Helper to check percentage rollout
    const isInPercentageRollout = (flag: FeatureFlag): boolean => {
      if (flag.percentage === undefined || flag.percentage === 100) return true
      if (flag.percentage === 0) return false
      
      const userId = user?.id || 'anonymous'
      const hash = hashString(`${flag.id}-${userId}`)
      
      return hash < flag.percentage
    }
    
    // Helper to select a variant
    const selectVariant = (flag: FeatureFlag): string | null => {
      if (!flag.variants || flag.variants.length === 0) return null
      
      const userId = user?.id || 'anonymous'
      const hash = hashString(`${flag.id}-variant-${userId}`)
      
      // Calculate total weight
      const totalWeight = flag.variants.reduce((sum, variant) => sum + variant.weight, 0)
      
      // If total weight is 0, return the first variant
      if (totalWeight === 0) return flag.variants[0].id
      
      // Select variant based on weighted distribution
      const targetWeight = hash % totalWeight
      let cumulativeWeight = 0
      
      for (const variant of flag.variants) {
        cumulativeWeight += variant.weight
        if (targetWeight < cumulativeWeight) {
          return variant.id
        }
      }
      
      // Fallback to first variant
      return flag.variants[0].id
    }
    
    // Process each flag
    featureFlags.forEach(flag => {
      // Store metadata regardless of flag state
      if (flag.metadata) {
        metadataResult[flag.id] = flag.metadata
      }
      
      // Determine if flag is enabled
      let isEnabled = flag.enabled
      
      // Only proceed with additional checks if the flag is enabled at the base level
      if (isEnabled) {
        isEnabled = isEnabled && areDependenciesMet(flag)
        isEnabled = isEnabled && isWithinDateRange(flag)
        isEnabled = isEnabled && isUserTargeted(flag)
        isEnabled = isEnabled && isInPercentageRollout(flag)
      }
      
      result[flag.id] = isEnabled
      
      // If flag is enabled and has variants, select one
      if (isEnabled && flag.variants && flag.variants.length > 0) {
        const selectedVariant = selectVariant(flag)
        if (selectedVariant) {
          variantResult[flag.id] = selectedVariant
        }
      }
    })
    
    return { flags: result, variants: variantResult, metadata: metadataResult }
  }, [featureFlags, user])
  
  // Check if a feature is enabled
  const isFeatureEnabled = useCallback((featureId: string): boolean => {
    return !!processedFlags.flags[featureId]
  }, [processedFlags.flags])
  
  // Get a feature variant
  const getFeatureVariant = useCallback((featureId: string): string | null => {
    return processedFlags.variants[featureId] || null
  }, [processedFlags.variants])
  
  // Get feature metadata
  const getFeatureMetadata = useCallback((featureId: string): Record<string, any> | null => {
    return processedFlags.metadata[featureId] || null
  }, [processedFlags.metadata])
  
  // Feature Flag component
  const FeatureFlag = useMemo(() => {
    return function FeatureFlag({
      feature,
      fallback = null,
      children,
    }: {
      feature: string
      fallback?: React.ReactNode
      children: React.ReactNode
    }) {
      return isFeatureEnabled(feature) ? <>{children}</> : <>{fallback}</>
    }
  }, [isFeatureEnabled])
  
  // Feature Variant component
  const FeatureVariant = useMemo(() => {
    return function FeatureVariant({
      feature,
      variant,
      fallback = null,
      children,
    }: {
      feature: string
      variant: string
      fallback?: React.ReactNode
      children: React.ReactNode
    }) {
      const isEnabled = isFeatureEnabled(feature)
      const currentVariant = getFeatureVariant(feature)
      
      return isEnabled && currentVariant === variant ? <>{children}</> : <>{fallback}</>
    }
  }, [isFeatureEnabled, getFeatureVariant])
  
  // Initial fetch
  useEffect(() => {
    // Try to load from localStorage first
    if (localStorageKey && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(localStorageKey)
        if (cached) {
          const { flags, timestamp } = JSON.parse(cached)
          // Only use cached flags if they're less than 1 hour old
          if (Date.now() - timestamp < 3600000) {
            setFeatureFlags(flags)
            setIsLoading(false)
          } else {
            // Cached flags are too old, fetch fresh ones
            fetchFlags()
          }
        } else {
          // No cached flags, fetch fresh ones
          fetchFlags()
        }
      } catch (err) {
        console.error('Failed to load cached feature flags:', err)
        fetchFlags()
      }
    } else {
      // No localStorage key, fetch fresh flags
      fetchFlags()
    }
  }, [fetchFlags, localStorageKey])
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchFlags, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [fetchFlags, refreshInterval])
  
  // Refresh when user changes
  useEffect(() => {
    if (user) {
      fetchFlags()
    }
  }, [user, fetchFlags])
  
  // Memoize context value
  const value = useMemo(() => ({
    flags: processedFlags.flags,
    variants: processedFlags.variants,
    isLoading,
    error,
    isFeatureEnabled,
    getFeatureVariant,
    getFeatureMetadata,
    refreshFlags: fetchFlags,
    FeatureFlag,
    FeatureVariant,
  }), [
    processedFlags.flags,
    processedFlags.variants,
    isLoading,
    error,
    isFeatureEnabled,
    getFeatureVariant,
    getFeatureMetadata,
    fetchFlags,
    FeatureFlag,
    FeatureVariant,
  ])
  
  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

// Custom hook to use the feature flags context
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider')
  }
  
  return context
}
