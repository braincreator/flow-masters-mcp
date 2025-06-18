import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/providers/Theme'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import type { Theme } from '@/config/theme'

export function useThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const { setHeaderTheme } = useHeaderTheme()
  const [isDark, setIsDark] = useState(false)
  const [isLight, setIsLight] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const switchTheme = useCallback((newTheme: Theme) => {
    if (!mounted) return

    setTheme(newTheme)
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setHeaderTheme(systemTheme)
    } else {
      setHeaderTheme(newTheme)
    }
  }, [mounted, setTheme, setHeaderTheme])

  const toggleTheme = useCallback(() => {
    if (!mounted) return

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      switchTheme(systemTheme === 'dark' ? 'light' : 'dark')
    } else {
      switchTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }, [mounted, theme, switchTheme])

  // Update isDark and isLight states
  useEffect(() => {
    if (!mounted) return

    const updateThemeStates = () => {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(theme === 'dark' || (theme === 'system' && systemPrefersDark))
      setIsLight(theme === 'light' || (theme === 'system' && !systemPrefersDark))
    }

    updateThemeStates()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateThemeStates)
      return () => mediaQuery.removeEventListener('change', updateThemeStates)
    }
  }, [theme, mounted])

  return {
    theme,
    switchTheme,
    toggleTheme,
    isDark,
    isLight,
    isSystem: theme === 'system'
  }
}
