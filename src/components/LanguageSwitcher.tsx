'use client'

import { useI18n } from './ClientProviders'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ReactCountryFlag from 'react-country-flag'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utilities/ui'

const locales = [
  { code: 'en', label: 'English', countryCode: 'US' },
  { code: 'ru', label: 'Русский', countryCode: 'RU' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const { lang: contextLang } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  
  // Get the current locale from the URL path
  const pathLocale = pathname?.split('/')[1]
  
  // Initialize currentLang with URL path locale if valid, otherwise use context
  const [currentLang, setCurrentLang] = useState(
    locales.some(loc => loc.code === pathLocale) ? pathLocale : contextLang
  )

  // Update current language when pathname changes
  useEffect(() => {
    const newPathLocale = pathname?.split('/')[1]
    if (newPathLocale && locales.some(loc => loc.code === newPathLocale)) {
      setCurrentLang(newPathLocale)
    }
  }, [pathname])

  const currentLanguage = locales.find(locale => locale.code === currentLang)

  const switchLanguage = async (code: string) => {
    if (!pathname) return

    // Handle root path
    if (pathname === '/') {
      router.push(`/${code}/home`)
      setIsOpen(false)
      return
    }

    // For posts collection, modify only the locale parameter
    if (pathname.startsWith('/posts/')) {
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('locale', code)
      router.push(currentUrl.pathname + currentUrl.search)
      setIsOpen(false)
      return
    }

    // Split the pathname into segments and remove empty strings
    const segments = pathname.split('/').filter(Boolean)
    
    // Find the current language segment index (if it exists)
    const langIndex = segments.findIndex(seg => locales.some(loc => loc.code === seg))
    
    // Create new segments array
    let newSegments
    if (langIndex !== -1) {
      // Replace existing language code
      segments[langIndex] = code
      newSegments = segments
    } else {
      // Add language code at the beginning
      newSegments = [code, ...segments]
    }

    // Reconstruct the path with leading slash
    const newPathname = '/' + newSegments.join('/')
    
    // Navigate to the new path and force a refresh
    router.push(newPathname)
    router.refresh()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ReactCountryFlag
          countryCode={currentLanguage?.countryCode || 'US'}
          svg
          style={{
            width: '1.2em',
            height: '1.2em',
          }}
          title={currentLanguage?.label}
        />
        <span className="text-sm">{currentLanguage?.label}</span>
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
              {locales.map(({ code, label, countryCode }) => (
                <motion.button
                  key={code}
                  whileHover={{ backgroundColor: 'rgba(var(--card-foreground), 0.1)' }}
                  onClick={() => switchLanguage(code)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-left w-full transition-colors',
                    code === currentLang && 'bg-accent text-accent-foreground'
                  )}
                  role="menuitem"
                >
                  <ReactCountryFlag
                    countryCode={countryCode}
                    svg
                    style={{
                      width: '1.2em',
                      height: '1.2em',
                    }}
                    title={label}
                  />
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
