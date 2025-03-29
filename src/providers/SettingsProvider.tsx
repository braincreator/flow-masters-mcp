'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import useSettings from '@/hooks/useSettings'

// Create a context type with the same shape as the useSettings return value
interface SettingsContextType {
  settings: any | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Create the context with a default value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsData = useSettings()

  return <SettingsContext.Provider value={settingsData}>{children}</SettingsContext.Provider>
}

// Hook for consuming the context
export function useSettingsContext() {
  const context = useContext(SettingsContext)

  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }

  return context
}

export default SettingsProvider
