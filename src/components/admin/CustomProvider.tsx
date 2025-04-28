'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define the context type
interface GlobalStateContextType {
  notifications: string[]
  addNotification: (message: string) => void
  clearNotifications: () => void
}

// Create the context with default values
const GlobalStateContext = createContext<GlobalStateContextType>({
  notifications: [],
  addNotification: () => {},
  clearNotifications: () => {},
})

// Custom hook to use the context
export const useGlobalState = () => useContext(GlobalStateContext)

// Provider component
const CustomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<string[]>([])

  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message])
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <GlobalStateContext.Provider
      value={{
        notifications,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  )
}

export default CustomProvider
