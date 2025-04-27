'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type LoadingStyle = 'minimal' | 'cosmic' | 'both'

interface LoadingConfigContextType {
  loadingStyle: LoadingStyle
  setLoadingStyle: (style: LoadingStyle) => void
  isFirstVisit: boolean
  setFirstVisit: (value: boolean) => void
}

const LoadingConfigContext = createContext<LoadingConfigContextType | undefined>(undefined)

export function LoadingConfigProvider({ children }: { children: React.ReactNode }) {
  const [loadingStyle, setLoadingStyle] = useState<LoadingStyle>('both')
  const [isFirstVisit, setFirstVisit] = useState(true)
  
  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStyle = localStorage.getItem('loadingStyle') as LoadingStyle | null
      if (savedStyle) {
        setLoadingStyle(savedStyle)
      }
      
      const firstVisit = localStorage.getItem('firstVisit') === null
      setFirstVisit(firstVisit)
      
      if (firstVisit) {
        localStorage.setItem('firstVisit', 'false')
      }
    }
  }, [])
  
  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('loadingStyle', loadingStyle)
    }
  }, [loadingStyle])
  
  return (
    <LoadingConfigContext.Provider value={{ 
      loadingStyle, 
      setLoadingStyle,
      isFirstVisit,
      setFirstVisit
    }}>
      {children}
    </LoadingConfigContext.Provider>
  )
}

export function useLoadingConfig() {
  const context = useContext(LoadingConfigContext)
  if (context === undefined) {
    throw new Error('useLoadingConfig must be used within a LoadingConfigProvider')
  }
  return context
}
