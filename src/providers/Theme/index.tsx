'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Theme, ThemeContextType } from './types'
import canUseDOM from '@/utilities/canUseDOM'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'
import Script from 'next/script'

const ThemeContext = createContext<ThemeContextType>({
  setTheme: () => null,
  theme: defaultTheme,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      const implicitPreference = getImplicitPreference()
      const newTheme = implicitPreference || defaultTheme
      setThemeState(newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      window.localStorage.removeItem(themeLocalStorageKey)
    } else {
      setThemeState(themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
    }
  }, [])

  // Initialize theme on mount
  useEffect(() => {
    if (!canUseDOM) return

    const storedTheme = window.localStorage.getItem(themeLocalStorageKey)
    let themeToSet: Theme = defaultTheme

    if (themeIsValid(storedTheme)) {
      themeToSet = storedTheme
    } else {
      const implicitPreference = getImplicitPreference()
      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }

    setThemeState(themeToSet)
    document.documentElement.setAttribute('data-theme', themeToSet)
    setMounted(true)
  }, [])

  return (
    <>
      <Script
        id="theme-script"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const storedTheme = localStorage.getItem('${themeLocalStorageKey}');
                if (storedTheme && ['dark', 'light'].includes(storedTheme)) {
                  document.documentElement.setAttribute('data-theme', storedTheme);
                  return;
                }
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', systemTheme);
              } catch (e) {
                document.documentElement.setAttribute('data-theme', '${defaultTheme}');
              }
            })();
          `,
        }}
      />
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </>
  )
}

export const useTheme = () => useContext(ThemeContext)
