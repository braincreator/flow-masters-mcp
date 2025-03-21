'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useDropdown } from '@/providers/DropdownContext'
import { useI18n } from '@/providers/I18n'

const locales = [
  { code: 'en', label: 'English', countryCode: 'US' },
  { code: 'ru', label: 'Русский', countryCode: 'RU' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const { lang, setLang } = useI18n()
  const { openDropdown, setOpenDropdown } = useDropdown()
  const isOpen = openDropdown === 'language'

  const currentLang = pathname?.split('/')[1] || lang
  const currentLanguage = locales.find(locale => locale.code === currentLang)

  const handleToggle = () => {
    setOpenDropdown(isOpen ? null : 'language')
  }

  const switchLanguage = (code: string) => {
    const segments = pathname?.split('/').filter(Boolean) || []
    const langIndex = segments.findIndex(seg => locales.some(loc => loc.code === seg))
    
    let newPathname
    if (langIndex !== -1) {
      segments[langIndex] = code
      newPathname = '/' + segments.join('/')
    } else {
      newPathname = `/${code}${pathname || ''}`
    }

    setLang(code)
    router.push(newPathname)
    setOpenDropdown(null)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-full 
                   hover:bg-warning/10 hover:text-warning
                   transition-all duration-300 ease-out"
      >
        <ReactCountryFlag
          countryCode={currentLanguage?.countryCode || 'US'}
          svg
          style={{
            width: '1.2em',
            height: '1.2em',
          }}
          className="transition-transform duration-300 group-hover:scale-110"
        />
        <span>{currentLanguage?.label}</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-all duration-300",
            isOpen ? "rotate-180 text-warning" : "rotate-0"
          )} 
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 mt-2 w-40 rounded-xl 
                       bg-card shadow-lg shadow-black/5 
                       border border-border overflow-hidden
                       dark:shadow-white/5"
          >
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => switchLanguage(locale.code)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5",
                  "transition-all duration-300",
                  "hover:bg-warning/10 hover:text-warning",
                  locale.code === currentLang && "bg-warning/10 text-warning"
                )}
              >
                <ReactCountryFlag
                  countryCode={locale.countryCode}
                  svg
                  style={{
                    width: '1.2em',
                    height: '1.2em',
                  }}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <span>{locale.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
