'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useTheme } from '..'
import { themeLocalStorageKey } from './types'
import type { Theme } from './types'
import { translations } from './translations'
import { usePathname } from 'next/navigation'

const themeIcons = {
  auto: Monitor,
  light: Sun,
  dark: Moon,
} as const

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] || 'en'
  
  const t = translations[currentLocale as keyof typeof translations] || translations.en

  const themes = [
    { value: 'auto', label: t.auto, icon: themeIcons.auto },
    { value: 'light', label: t.light, icon: themeIcons.light },
    { value: 'dark', label: t.dark, icon: themeIcons.dark },
  ] as const

  const currentTheme = themes.find(theme => theme.value === value)

  const onThemeChange = (themeToSet: Theme | 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
      setValue('auto')
    } else {
      setTheme(themeToSet)
      setValue(themeToSet)
    }
    setIsOpen(false)
  }

  useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue(preference ?? 'auto')
  }, [])

  const Icon = currentTheme?.icon || Monitor

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm">{currentTheme?.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-10 mt-2 w-40 rounded-lg overflow-hidden bg-card border border-border shadow-lg"
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {themes.map(({ value, label, icon: ThemeIcon }) => (
                <motion.button
                  key={value}
                  whileHover={{ backgroundColor: 'rgba(var(--card-foreground), 0.1)' }}
                  onClick={() => onThemeChange(value as Theme | 'auto')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-left w-full transition-colors',
                    value === currentTheme?.value && 'bg-accent text-accent-foreground'
                  )}
                >
                  <ThemeIcon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
