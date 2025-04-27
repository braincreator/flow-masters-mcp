'use client'

import { useContext } from 'react'
import { 
  UserPreferencesContext, 
  UserPreferencesContextType,
  UserPreferences,
  EmailNotifications,
  PushNotifications,
  AccessibilityPreferences,
  PrivacyPreferences,
  AppearancePreferences
} from '@/providers/UserPreferencesProvider'

/**
 * Custom hook to select specific parts of the user preferences context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 * 
 * @param selector A function that selects specific parts of the user preferences context
 * @returns The selected parts of the user preferences context
 */
export function useUserPreferencesSelector<T>(selector: (context: UserPreferencesContextType) => T): T {
  const context = useContext(UserPreferencesContext)
  
  if (context === undefined) {
    throw new Error('useUserPreferencesSelector must be used within a UserPreferencesProvider')
  }
  
  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the email notification preferences
 */
export function useEmailNotificationPreferences() {
  return useUserPreferencesSelector(context => {
    const emailPrefs = context.getPreferenceSection('emailNotifications')
    return {
      emailNotifications: emailPrefs,
      updateEmailNotifications: (newValues: Partial<EmailNotifications>) => 
        context.updatePreferenceSection('emailNotifications', newValues),
      resetEmailNotifications: () => context.resetSection('emailNotifications'),
      isLoading: context.isLoading,
    }
  })
}

/**
 * Select only the push notification preferences
 */
export function usePushNotificationPreferences() {
  return useUserPreferencesSelector(context => {
    const pushPrefs = context.getPreferenceSection('pushNotifications')
    return {
      pushNotifications: pushPrefs,
      updatePushNotifications: (newValues: Partial<PushNotifications>) => 
        context.updatePreferenceSection('pushNotifications', newValues),
      resetPushNotifications: () => context.resetSection('pushNotifications'),
      isLoading: context.isLoading,
    }
  })
}

/**
 * Select only the accessibility preferences
 */
export function useAccessibilityPreferences() {
  return useUserPreferencesSelector(context => {
    const accessibilityPrefs = context.getPreferenceSection('accessibility')
    return {
      accessibility: accessibilityPrefs,
      updateAccessibility: (newValues: Partial<AccessibilityPreferences>) => 
        context.updatePreferenceSection('accessibility', newValues),
      resetAccessibility: () => context.resetSection('accessibility'),
      isLoading: context.isLoading,
    }
  })
}

/**
 * Select only the privacy preferences
 */
export function usePrivacyPreferences() {
  return useUserPreferencesSelector(context => {
    const privacyPrefs = context.getPreferenceSection('privacy')
    return {
      privacy: privacyPrefs,
      updatePrivacy: (newValues: Partial<PrivacyPreferences>) => 
        context.updatePreferenceSection('privacy', newValues),
      resetPrivacy: () => context.resetSection('privacy'),
      isLoading: context.isLoading,
    }
  })
}

/**
 * Select only the appearance preferences
 */
export function useAppearancePreferences() {
  return useUserPreferencesSelector(context => {
    const appearancePrefs = context.getPreferenceSection('appearance')
    return {
      appearance: appearancePrefs,
      updateAppearance: (newValues: Partial<AppearancePreferences>) => 
        context.updatePreferenceSection('appearance', newValues),
      resetAppearance: () => context.resetSection('appearance'),
      isLoading: context.isLoading,
    }
  })
}

/**
 * Select only the content preferences
 */
export function useContentPreferences() {
  return useUserPreferencesSelector(context => {
    const contentPrefs = context.getPreferenceSection('contentPreferences')
    return {
      contentPreferences: contentPrefs,
      updateContentPreferences: (newValues: Partial<UserPreferences['contentPreferences']>) => 
        context.updatePreferenceSection('contentPreferences', newValues),
      resetContentPreferences: () => context.resetSection('contentPreferences'),
      isLoading: context.isLoading,
    }
  })
}

/**
 * Select only the notification frequency preference
 */
export function useNotificationFrequency() {
  return useUserPreferencesSelector(context => {
    return {
      notificationFrequency: context.preferences.notificationFrequency,
      updateNotificationFrequency: (frequency: UserPreferences['notificationFrequency']) => 
        context.updatePreferences({ notificationFrequency: frequency }),
      isLoading: context.isLoading,
    }
  })
}

/**
 * Select only the display mode preference
 */
export function useDisplayMode() {
  return useUserPreferencesSelector(context => {
    return {
      displayMode: context.preferences.displayMode,
      updateDisplayMode: (mode: UserPreferences['displayMode']) => 
        context.updatePreferences({ displayMode: mode }),
      isLoading: context.isLoading,
    }
  })
}
