'use client'

import { useContext } from 'react'
import { LocaleContext, LocaleContextType } from '@/providers/LocaleProvider'

/**
 * Custom hook to select specific parts of the locale context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 *
 * @param selector A function that selects specific parts of the locale context
 * @returns The selected parts of the locale context
 */
export function useLocaleSelector<T>(selector: (context: LocaleContextType) => T): T {
  const context = useContext(LocaleContext)

  if (context === undefined) {
    throw new Error('useLocaleSelector must be used within a LocaleProvider')
  }

  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the current locale state from the locale context
 */
export function useCurrentLocale() {
  return useLocaleSelector((context) => ({
    locale: context.locale,
    localeInfo: context.localeInfo,
    setLocale: context.setLocale,
  }))
}

/**
 * Select only the supported locales from the locale context
 */
export function useSupportedLocales() {
  return useLocaleSelector((context) => ({
    supportedLocales: context.supportedLocales,
  }))
}

/**
 * Select only the path localization functionality from the locale context
 */
export function useLocalizedPaths() {
  return useLocaleSelector((context) => ({
    locale: context.locale,
    getLocalizedPath: context.getLocalizedPath,
  }))
}

/**
 * Select only the formatting functionality from the locale context
 */
export function useLocaleFormatting() {
  return useLocaleSelector((context) => ({
    locale: context.locale,
    formatDate: context.formatDate,
    formatNumber: context.formatNumber,
    formatCurrency: context.formatCurrency,
  }))
}
