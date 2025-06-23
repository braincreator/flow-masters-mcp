'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define types for user preferences
export interface EmailNotifications {
  account: boolean
  marketing: boolean
  courses: boolean
  achievements: boolean
  comments: boolean
  newsletter: boolean
  productUpdates: boolean
  security: boolean
}

export interface PushNotifications {
  account: boolean
  marketing: boolean
  courses: boolean
  achievements: boolean
  comments: boolean
  newsletter: boolean
  productUpdates: boolean
  security: boolean
}

export interface AccessibilityPreferences {
  reduceMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface PrivacyPreferences {
  shareActivity: boolean
  shareProgress: boolean
  allowProfileViews: boolean
  showOnlineStatus: boolean
  allowDataCollection: boolean
}

export interface AppearancePreferences {
  theme: 'light' | 'dark' | 'system'
  colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'orange'
  fontSize: 'small' | 'medium' | 'large'
  fontFamily: 'system' | 'serif' | 'sans-serif' | 'monospace'
  reducedAnimations: boolean
}

export interface UserPreferences {
  emailNotifications: EmailNotifications
  pushNotifications: PushNotifications
  notificationFrequency: 'immediately' | 'daily' | 'weekly' | 'never'
  displayMode: 'compact' | 'comfortable' | 'default'
  language: string
  timezone: string
  accessibility: AccessibilityPreferences
  privacy: PrivacyPreferences
  appearance: AppearancePreferences
  contentPreferences: {
    showExplicitContent: boolean
    contentLanguages: string[]
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'all'
  }
}

export interface UserPreferencesContextType {
  // State
  preferences: UserPreferences
  isLoading: boolean
  error: Error | null

  // Methods for managing all preferences
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>
  refreshPreferences: () => Promise<void>
  resetPreferences: () => Promise<void>

  // Methods for managing specific sections
  getPreferenceSection: <T extends keyof UserPreferences>(section: T) => UserPreferences[T]
  updatePreferenceSection: <T extends keyof UserPreferences>(
    section: T,
    newValues: Partial<UserPreferences[T]>,
  ) => Promise<void>
  resetSection: <T extends keyof UserPreferences>(section: T) => Promise<void>
}

// Default preferences
const defaultPreferences: UserPreferences = {
  emailNotifications: {
    account: true,
    marketing: false,
    courses: true,
    achievements: true,
    comments: false,
    newsletter: true,
    productUpdates: true,
    security: true,
  },
  pushNotifications: {
    account: true,
    marketing: false,
    courses: true,
    achievements: true,
    comments: true,
    newsletter: false,
    productUpdates: false,
    security: true,
  },
  notificationFrequency: 'immediately',
  displayMode: 'default',
  language: 'en',
  timezone: 'UTC',
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: false,
  },
  privacy: {
    shareActivity: true,
    shareProgress: true,
    allowProfileViews: true,
    showOnlineStatus: true,
    allowDataCollection: true,
  },
  appearance: {
    theme: 'system',
    colorScheme: 'default',
    fontSize: 'medium',
    fontFamily: 'system',
    reducedAnimations: false,
  },
  contentPreferences: {
    showExplicitContent: false,
    contentLanguages: ['en'],
    difficultyLevel: 'all',
  },
}

export const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(
  undefined,
)

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch user preferences
  const fetchPreferences = async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      // Use default preferences for non-authenticated users
      setPreferences(defaultPreferences)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/users/notification-preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user preferences')
      }

      const data = await response.json()

      // Merge with defaults to ensure all fields exist
      setPreferences({
        ...defaultPreferences,
        ...data,
      })

      setError(null)
    } catch (err) {
      logError('Error fetching user preferences:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch user preferences'))
      // Fall back to defaults on error
      setPreferences(defaultPreferences)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch preferences on mount and when auth state changes
  useEffect(() => {
    fetchPreferences()
  }, [isAuthenticated, user])

  // Update user preferences
  const updatePreferences = async (newPreferences: Partial<UserPreferences>): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to update preferences')
    }

    // Create updated preferences by merging current with new
    const updatedPreferences = {
      ...preferences,
      ...newPreferences,
    }

    // Optimistically update UI
    setPreferences(updatedPreferences)

    try {
      const response = await fetch('/api/users/notification-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailNotifications: updatedPreferences.emailNotifications,
          pushNotifications: updatedPreferences.pushNotifications,
          notificationFrequency: updatedPreferences.notificationFrequency,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update preferences')
      }
    } catch (err) {
      // Revert to previous state on error
      await fetchPreferences()

      logError('Error updating user preferences:', err)
      throw err
    }
  }

  // Get specific preference section
  const getPreferenceSection = <T extends keyof UserPreferences>(
    section: T,
  ): UserPreferences[T] => {
    return preferences[section]
  }

  // Update specific preference section
  const updatePreferenceSection = async <T extends keyof UserPreferences>(
    section: T,
    newValues: Partial<UserPreferences[T]>,
  ): Promise<void> => {
    const updatedSection = {
      ...preferences[section],
      ...newValues,
    }

    const newPreferences = {
      ...preferences,
      [section]: updatedSection,
    }

    await updatePreferences(newPreferences)
  }

  // Reset preferences to defaults
  const resetPreferences = async (): Promise<void> => {
    await updatePreferences(defaultPreferences)
  }

  // Reset specific section to defaults
  const resetSection = async <T extends keyof UserPreferences>(section: T): Promise<void> => {
    await updatePreferenceSection(section, defaultPreferences[section])
  }

  const value = {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences: fetchPreferences,
    getPreferenceSection,
    updatePreferenceSection,
    resetPreferences,
    resetSection,
  }

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}
