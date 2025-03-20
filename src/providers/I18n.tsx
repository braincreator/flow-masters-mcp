'use client'

import React, { createContext, useContext, useState } from 'react'

type I18nContextType = {
  lang: string
  setLang: (lang: string) => void
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
})

export const useI18n = () => useContext(I18nContext)

interface I18nProviderProps {
  children: React.ReactNode
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