'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { ThemeProvider } from '@/providers/Theme'

type I18nContextType = {
  lang: string
  setLang: (lang: string) => void
}

const I18nContext = createContext<I18nContextType>({
  lang: 'ru',
  setLang: () => {},
})

export const useI18n = () => useContext(I18nContext)

export function ClientProviders({
  children,
  lang: initialLang,
}: {
  children: React.ReactNode
  lang: string
}) {
  const [lang, setLang] = useState(initialLang)

  // Update lang when initialLang prop changes
  useEffect(() => {
    if (initialLang !== lang) {
      setLang(initialLang)
    }
  }, [initialLang])

  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <I18nContext.Provider value={{ lang, setLang }}>
          {children}
        </I18nContext.Provider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
} 
