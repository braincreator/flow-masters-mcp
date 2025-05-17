"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import Notification, { NotificationType } from '@/components/ui/Notification'

interface NotificationContextProps {
  showNotification: (type: NotificationType, message: string, duration?: number) => void
  hideNotification: () => void
}

// Создаем контекст с пустыми значениями по умолчанию
const NotificationContext = createContext<NotificationContextProps>({
  showNotification: () => {},
  hideNotification: () => {},
})

// Интерфейс для состояния уведомления
interface NotificationState {
  type: NotificationType
  message: string
  isVisible: boolean
  duration: number
}

// Интерфейс для провайдера контекста
interface NotificationProviderProps {
  children: ReactNode
}

// Провайдер контекста
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Состояние для текущего уведомления
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    message: '',
    isVisible: false,
    duration: 3000,
  })

  // Функция для показа уведомления
  const showNotification = (type: NotificationType, message: string, duration: number = 3000) => {
    setNotification({
      type,
      message,
      isVisible: true,
      duration,
    })
  }

  // Функция для скрытия уведомления
  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }))
  }

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}

      {/* Рендер уведомления, если оно видимо */}
      {notification.isVisible && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={hideNotification}
            duration={notification.duration}
          />
        </div>
      )}
    </NotificationContext.Provider>
  )
}

// Хук для использования контекста уведомлений
export const useNotification = () => useContext(NotificationContext)

export default NotificationContext
