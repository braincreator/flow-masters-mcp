'use client'

import { useTheme } from '@/providers/Theme'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import type { Theme } from '../types'

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 rounded-full"
        aria-hidden="true"
      >
        <Moon className="h-4 w-4 rounded-full" />
      </Button>
    )
  }

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full hover:bg-muted/30"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 rounded-full transition-transform duration-300 hover:rotate-90" />
      ) : (
        <Moon className="h-5 w-5 rounded-full transition-transform duration-300 hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
