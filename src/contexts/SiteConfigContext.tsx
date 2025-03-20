'use client'

import { createContext, useContext, ReactNode } from 'react'
import { SiteConfig } from '../payload-types'

const SiteConfigContext = createContext<SiteConfig | null>(null)

export function SiteConfigProvider({ 
  children, 
  config 
}: { 
  children: ReactNode
  config: SiteConfig 
}) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext)
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider')
  }
  return context
}