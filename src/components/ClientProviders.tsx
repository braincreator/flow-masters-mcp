'use client'

import { createContext, useContext } from 'react'

type I18nContextType = {
  lang: string
}

const I18nContext = createContext<I18nContextType>({ lang: 'en' })

export function useI18n() {
  return useContext(I18nContext)
}

export function ClientProviders({
  children,
  lang,
}: {
  children: React.ReactNode
  lang: string
}) {
  return (
    <I18nContext.Provider value={{ lang }}>
      {children}
    </I18nContext.Provider>
  )
} 