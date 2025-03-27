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
        // Проверяем, кликнул ли пользователь вне открытого дропдауна
        // Сначала ищем элемент с id равным openDropdown
        const dropdownElement = document.getElementById(openDropdown)

        // Также ищем кнопку, которая открывает дропдаун
        // Обычно она находится прямо перед dropdown и имеет атрибут aria-expanded="true"
        const dropdownTrigger = document.querySelector(
          `[aria-controls="${openDropdown}"], button[aria-expanded="true"]`,
        )

        // Если клик был не внутри дропдауна и не на кнопке-триггере
        if (
          dropdownElement &&
          !dropdownElement.contains(target) &&
          (!dropdownTrigger || !dropdownTrigger.contains(target))
        ) {
          // Закрываем дропдаун
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
