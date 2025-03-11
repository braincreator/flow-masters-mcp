'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import ReactCountryFlag from 'react-country-flag'

const locales = [
  { code: 'en', label: 'English', countryCode: 'US' },
  { code: 'ru', label: 'Русский', countryCode: 'RU' },
]

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = pathname.split('/')[1] || 'en'
  const [isOpen, setIsOpen] = useState(false)

  const switchLanguage = useCallback(
    (locale: string) => {
      const currentPathParts = pathname.split('/')
      currentPathParts[1] = locale
      const newPath = currentPathParts.join('/')
      router.push(newPath)
      setIsOpen(false)
    },
    [pathname, router],
  )

  const currentLocaleData = locales.find((locale) => locale.code === currentLocale) || locales[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors duration-300 ease-in-out"
      >
        <ReactCountryFlag
          countryCode={currentLocaleData!.countryCode}
          svg
          style={{
            width: '1.2em',
            height: '1.2em',
          }}
          title={currentLocaleData!.label}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-32 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {locales.map(({ code, label, countryCode }) => (
              <button
                key={code}
                onClick={() => switchLanguage(code)}
                className={`flex items-center gap-2 px-3 py-1.5 text-left w-full hover:bg-white/20 transition-colors duration-300 ease-in-out ${
                  currentLocale === code ? 'bg-white/20' : ''
                } text-white`}
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
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
