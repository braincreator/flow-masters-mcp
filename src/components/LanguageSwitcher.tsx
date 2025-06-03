'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useDropdown } from '@/providers/DropdownContext'
import { useI18n } from '@/providers/I18n'
import { useLocale } from '@/providers/LocaleProvider'

const locales = [
  { code: 'en', label: 'English', countryCode: 'US' },
  { code: 'ru', label: 'Русский', countryCode: 'RU' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  // Use both providers for backward compatibility
  const { lang, setLang } = useI18n()

  // Try to use LocaleProvider, but handle case when it's not available
  let locale, setLocale, supportedLocales
  try {
    const localeContext = useLocale()
    locale = localeContext.locale
    setLocale = localeContext.setLocale
    supportedLocales = localeContext.supportedLocales
  } catch (error) {
    // LocaleProvider not available, use fallback
    locale = undefined
    setLocale = undefined
    supportedLocales = undefined
  }

  const { openDropdown, setOpenDropdown } = useDropdown()
  const isOpen = openDropdown === 'language'

  // Use locale from LocaleProvider if available, otherwise determine from pathname
  // With 'always' prefix: all locales have prefix (/ru/, /en/)
  const pathSegments = pathname?.split('/').filter(Boolean) || []
  const langFromPath = pathSegments.find((seg) => locales.some((loc) => loc.code === seg))
  const currentLang = locale || langFromPath || 'ru' // Default to 'ru' if no locale in path
  const currentLanguage = locales.find((locale) => locale.code === currentLang)

  const handleToggle = () => {
    setOpenDropdown(isOpen ? null : 'language')
  }

  const switchLanguage = (code: string) => {
    // Update both providers for backward compatibility
    setLang(code)

    // Use LocaleProvider's setLocale if available, which handles path updates
    if (setLocale) {
      setLocale(code as any) // Type cast to match Locale type
      setOpenDropdown(null)
      return
    }

    // Fallback to manual path manipulation if LocaleProvider is not available
    const segments = pathname?.split('/').filter(Boolean) || []
    const currentLangInPath = segments.find((seg) => locales.some((loc) => loc.code === seg))

    let newPathname

    // Handle 'always' locale prefix behavior
    // All locales have prefix (/ru/, /en/)
    if (currentLangInPath) {
      // Replace current locale
      const langIndex = segments.findIndex((seg) => locales.some((loc) => loc.code === seg))
      segments[langIndex] = code
      newPathname = '/' + segments.join('/')
    } else {
      // Add locale prefix to current path
      const pathWithoutLeadingSlash = pathname?.startsWith('/')
        ? pathname.substring(1)
        : pathname || ''
      newPathname = `/${code}${pathWithoutLeadingSlash ? `/${pathWithoutLeadingSlash}` : ''}`
    }

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
                   hover:bg-accent/10 hover:text-accent
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
            'h-4 w-4 transition-all duration-300',
            isOpen ? 'rotate-180 text-accent' : 'rotate-0',
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
                  'flex w-full items-center gap-2 px-4 py-2.5',
                  'transition-all duration-300',
                  'hover:bg-accent/10 hover:text-accent',
                  locale.code === currentLang && 'bg-accent/10 text-accent',
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
