'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeSwitch } from '@/hooks/useThemeSwitch'
import { cn } from '@/utilities/ui'

export const ThemeSelector = () => {
  const { toggleTheme, isDark } = useThemeSwitch()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 rounded-full w-9 h-9 p-0"
        aria-hidden="true"
      >
        <Moon className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "rounded-full w-9 h-9 p-0",
        "hover:bg-accent/10 hover:text-accent",
        "dark:hover:bg-accent/20 dark:hover:text-accent-foreground",
        "transition-all duration-300"
      )}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
        ) : (
          <Moon className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
        )}
      </motion.div>
      <span className="sr-only">
        {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      </span>
    </Button>
  )
}
