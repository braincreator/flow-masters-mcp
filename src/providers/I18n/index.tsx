'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type I18nContextType = {
  lang: string
  setLang: (lang: string) => void
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
})

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

interface I18nProviderProps {
  children: ReactNode
  defaultLang: string
}

export function I18nProvider({ children, defaultLang }: I18nProviderProps) {
  const [lang, setLang] = useState(defaultLang)

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  )
}