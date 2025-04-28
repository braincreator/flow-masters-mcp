'use client'

import { useContext } from 'react'
import { FeatureFlagsContext, FeatureFlagsContextType } from '@/providers/FeatureFlagsProvider'

/**
 * Custom hook to select specific parts of the feature flags context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 *
 * @param selector A function that selects specific parts of the feature flags context
 * @returns The selected parts of the feature flags context
 */
export function useFeatureFlagsSelector<T>(selector: (context: FeatureFlagsContextType) => T): T {
  const context = useContext(FeatureFlagsContext)

  if (context === undefined) {
    throw new Error('useFeatureFlagsSelector must be used within a FeatureFlagsProvider')
  }

  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the feature flags state
 */
export function useFeatureFlagsState() {
  return useFeatureFlagsSelector((context) => ({
    flags: context.flags,
    variants: context.variants,
    isLoading: context.isLoading,
    error: context.error,
  }))
}

/**
 * Select only the feature flags methods
 */
export function useFeatureFlagsMethods() {
  return useFeatureFlagsSelector((context) => ({
    isFeatureEnabled: context.isFeatureEnabled,
    getFeatureVariant: context.getFeatureVariant,
    getFeatureMetadata: context.getFeatureMetadata,
    refreshFlags: context.refreshFlags,
  }))
}

/**
 * Select only the feature flags components
 */
export function useFeatureFlagsComponents() {
  return useFeatureFlagsSelector((context) => ({
    FeatureFlag: context.FeatureFlag,
    FeatureVariant: context.FeatureVariant,
  }))
}

/**
 * Check if a specific feature is enabled
 */
export function useFeature(featureId: string) {
  return useFeatureFlagsSelector((context) => ({
    isEnabled: context.isFeatureEnabled(featureId),
    variant: context.getFeatureVariant(featureId),
    metadata: context.getFeatureMetadata(featureId),
  }))
}

/**
 * Check if multiple features are enabled
 */
export function useFeatures(featureIds: string[]) {
  return useFeatureFlagsSelector((context) => {
    const result: Record<
      string,
      { isEnabled: boolean; variant: string | null; metadata: Record<string, any> | null }
    > = {}

    featureIds.forEach((id) => {
      result[id] = {
        isEnabled: context.isFeatureEnabled(id),
        variant: context.getFeatureVariant(id),
        metadata: context.getFeatureMetadata(id),
      }
    })

    return result
  })
}

/**
 * Check if all specified features are enabled
 */
export function useAllFeaturesEnabled(featureIds: string[]) {
  return useFeatureFlagsSelector((context) =>
    featureIds.every((id) => context.isFeatureEnabled(id)),
  )
}

/**
 * Check if any of the specified features are enabled
 */
export function useAnyFeatureEnabled(featureIds: string[]) {
  return useFeatureFlagsSelector((context) => featureIds.some((id) => context.isFeatureEnabled(id)))
}
