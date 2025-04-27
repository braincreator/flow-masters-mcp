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
interface LocaleContextType {
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
const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

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
        const currentLocale = segments[0]

        if (SUPPORTED_LOCALES.includes(currentLocale as Locale)) {
          // Replace the locale segment
          segments[0] = newLocale
        } else {
          // Add locale segment at the beginning
          segments.unshift(newLocale)
        }

        const newPath = `/${segments.join('/')}`
        router.push(newPath)
      }
    },
    [pathname, router],
  )

  // Get localized path
  const getLocalizedPath = useCallback(
    (path: string, newLocale?: Locale): string => {
      const localeToUse = newLocale || locale

      // If path already starts with locale, replace it
      const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path
      const segments = pathWithoutLeadingSlash.split('/')

      if (SUPPORTED_LOCALES.includes(segments[0] as Locale)) {
        segments[0] = localeToUse
        return `/${segments.join('/')}`
      }

      // Otherwise, add locale prefix
      return `/${localeToUse}/${pathWithoutLeadingSlash}`
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
      const urlLocale = segments[0]

      if (SUPPORTED_LOCALES.includes(urlLocale as Locale) && urlLocale !== locale) {
        setLocaleState(urlLocale as Locale)
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
