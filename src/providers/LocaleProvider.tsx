'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@/constants'

// Define locale information
export interface LocaleInfo {
  code: Locale
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
}

// Define the context type
export interface LocaleContextType {
  // State
  locale: Locale
  localeInfo: LocaleInfo
  supportedLocales: LocaleInfo[]

  // Methods
  setLocale: (locale: Locale) => void
  getLocalizedPath: (path: string, newLocale?: Locale) => string
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (amount: number, currency?: string, options?: Intl.NumberFormatOptions) => string
}

// Locale information for supported locales
const localeInfoMap: Record<Locale, LocaleInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'US',
    direction: 'ltr',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: 'RU',
    direction: 'ltr',
  },
}

// Create the context
export const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// Provider component
export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const router = useRouter()
  const pathname = usePathname()

  // State
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  // Set locale in state and cookies
  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!SUPPORTED_LOCALES.includes(newLocale)) {
        console.warn(
          `Locale ${newLocale} is not supported. Using default locale ${DEFAULT_LOCALE} instead.`,
        )
        newLocale = DEFAULT_LOCALE
      }

      // Update state
      setLocaleState(newLocale)

      // Save to cookies
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000` // 1 year

      // Redirect to the same page with the new locale
      if (pathname) {
        const segments = pathname.split('/').filter(Boolean)
        const currentLocaleInPath = segments.find((seg) =>
          SUPPORTED_LOCALES.includes(seg as Locale),
        )

        let newPath

        // Handle 'always' locale prefix behavior
        // All locales have prefix (/ru/, /en/)
        if (currentLocaleInPath) {
          // Replace current locale
          const localeIndex = segments.findIndex((seg) => SUPPORTED_LOCALES.includes(seg as Locale))
          segments[localeIndex] = newLocale
          newPath = `/${segments.join('/')}`
        } else {
          // Add locale prefix
          newPath = `/${newLocale}${pathname}`
        }

        router.push(newPath)
      }
    },
    [pathname, router],
  )

  // Get localized path
  const getLocalizedPath = useCallback(
    (path: string, newLocale?: Locale): string => {
      const localeToUse = newLocale || locale

      // Handle 'always' locale prefix behavior
      // All locales have prefix (/ru/, /en/)
      const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path
      const segments = pathWithoutLeadingSlash.split('/').filter(Boolean)
      const currentLocaleInPath = segments.find((seg) => SUPPORTED_LOCALES.includes(seg as Locale))

      if (currentLocaleInPath) {
        // Replace current locale
        const localeIndex = segments.findIndex((seg) => SUPPORTED_LOCALES.includes(seg as Locale))
        segments[localeIndex] = localeToUse
        return `/${segments.join('/')}`
      } else {
        // Add locale prefix
        return `/${localeToUse}${path}`
      }
    },
    [locale],
  )

  // Format date according to locale
  const formatDate = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date

      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      }).format(dateObj)
    },
    [locale],
  )

  // Format number according to locale
  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(locale, options).format(number)
    },
    [locale],
  )

  // Format currency according to locale
  const formatCurrency = useCallback(
    (amount: number, currency = 'USD', options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        ...options,
      }).format(amount)
    },
    [locale],
  )

  // Update locale from URL on mount and pathname change
  useEffect(() => {
    if (pathname) {
      const segments = pathname.split('/').filter(Boolean)
      const urlLocale = segments.find((seg) => SUPPORTED_LOCALES.includes(seg as Locale))

      if (urlLocale && urlLocale !== locale) {
        setLocaleState(urlLocale as Locale)
      } else if (!urlLocale) {
        // No locale in URL with 'always' prefix means we need to redirect
        // This shouldn't happen with 'always' prefix, but handle gracefully
        setLocaleState(DEFAULT_LOCALE)
      }
    }
  }, [pathname, locale])

  // Memoize context value to prevent unnecessary re-renders
  const value = React.useMemo(
    () => ({
      // State
      locale,
      localeInfo: localeInfoMap[locale],
      supportedLocales: SUPPORTED_LOCALES.map((code) => localeInfoMap[code]),

      // Methods
      setLocale,
      getLocalizedPath,
      formatDate,
      formatNumber,
      formatCurrency,
    }),
    [locale, setLocale, getLocalizedPath, formatDate, formatNumber, formatCurrency],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

// Custom hook to use the locale context
export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
