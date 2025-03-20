'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/providers/Theme'
import { useDropdown } from '@/providers/DropdownContext'
import { Monitor, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utilities/ui'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Theme } from '../types'
import { translations } from './translations'
import { useI18n } from '@/providers/I18n'

const themes = [
  { value: 'auto', label: 'auto', icon: Monitor },
  { value: 'light', label: 'light', icon: Sun },
  { value: 'dark', label: 'dark', icon: Moon },
] as const

export const ThemeSelector = () => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState('auto')
  const { openDropdown, setOpenDropdown } = useDropdown()
  const { lang } = useI18n()
  const isOpen = openDropdown === 'theme'

  const currentTheme = themes.find(theme => theme.value === value)
  const Icon = currentTheme?.icon || Monitor

  const handleToggle = () => {
    setOpenDropdown(isOpen ? null : 'theme')
  }

  const onThemeChange = (themeToSet: Theme | 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
    } else {
      setTheme(themeToSet)
    }
    setValue(themeToSet)
    setOpenDropdown(null)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-full"
      >
        <Icon className="h-4 w-4" />
        <span>{translations[lang][currentTheme?.label || 'auto']}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 mt-2 w-40 rounded-xl bg-white dark:bg-gray-800 shadow-lg border overflow-hidden"
          >
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => onThemeChange(theme.value as Theme | 'auto')}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 transition-colors duration-200",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  theme.value === value && "bg-gray-100 dark:bg-gray-700"
                )}
              >
                <theme.icon className="h-4 w-4" />
                <span>{translations[lang][theme.label]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
