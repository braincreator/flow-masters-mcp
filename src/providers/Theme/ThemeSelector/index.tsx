'use client'

import { useTheme } from '@/providers/Theme'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import type { Theme } from '../types'
import { motion } from 'framer-motion'

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
        className="opacity-0 rounded-full p-1"
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
      className="rounded-full p-1 
                 hover:bg-warning/10 hover:text-warning
                 transition-all duration-300 ease-out"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 rounded-full 
                         transition-all duration-300
                         hover:scale-110" />
        ) : (
          <Moon className="h-5 w-5 rounded-full 
                         transition-all duration-300
                         hover:scale-110" />
        )}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
