'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Theme } from '@/config/theme'
import { themeLocalStorageKey } from './shared'
import { themeConfig } from '@/config/theme'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themeConfig.defaultTheme,
  setTheme: () => null,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themeConfig.defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Initialize theme
  useEffect(() => {
    setMounted(true)

    // Only access localStorage after mounting to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(themeLocalStorageKey) as Theme | null
      if (stored && themeConfig.themes.includes(stored)) {
        setThemeState(stored)
        applyTheme(stored)
      } else {
        applyTheme(themeConfig.defaultTheme)
      }
    }
  }, [])

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return // SSR guard

    const root = document.documentElement
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.setAttribute('data-theme', systemTheme)
    } else {
      root.setAttribute('data-theme', newTheme)
    }
  }, [])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      if (typeof window !== 'undefined') {
        localStorage.setItem(themeLocalStorageKey, newTheme)
      }
      applyTheme(newTheme)
    },
    [applyTheme],
  )

  // Handle system theme changes
  useEffect(() => {
    if (!mounted) return

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')

      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme, mounted, applyTheme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
