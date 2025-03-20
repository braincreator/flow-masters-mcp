'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type DropdownContextType = {
  openDropdown: string | null
  setOpenDropdown: (id: string | null) => void
}

const DropdownContext = createContext<DropdownContextType>({
  openDropdown: null,
  setOpenDropdown: () => {},
})

export const useDropdown = () => {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider')
  }
  return context
}

export const DropdownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const target = event.target as HTMLElement
        if (!target.closest('.relative')) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openDropdown])

  return (
    <DropdownContext.Provider value={{ openDropdown, setOpenDropdown }}>
      {children}
    </DropdownContext.Provider>
  )
}
