'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { fetchNotifications, markNotificationAsRead } from '@/lib/api/notifications'
import { useAuth } from '@/hooks/useAuth'
import { tryCatch, AppError, ErrorType, ErrorSeverity } from '@/utilities/errorHandling'
import { useStateLogger } from '@/utilities/stateLogger'
import { toast } from 'sonner'

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'system'
  | 'achievement'
  | 'message'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  expiresAt?: string
  link?: string
  icon?: string
  metadata?: Record<string, any>
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export interface ToastOptions {
  duration?: number
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'
  onDismiss?: () => void
  onAutoClose?: () => void
  dismissible?: boolean
  important?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export interface NotificationsContextType {
  // Persistent notifications
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: Error | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refetchNotifications: () => Promise<void>

  // Toast notifications
  showToast: (
    type: NotificationType,
    title: string,
    message?: string,
    options?: ToastOptions,
  ) => void
  dismissToast: (toastId: string) => void

  // Create and add a new notification
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>,
  ) => Promise<void>

  // Filter notifications
  getNotificationsByType: (type: NotificationType) => Notification[]
  getUnreadNotifications: () => Notification[]
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<AppError | null>(null)
  const logger = useStateLogger('NotificationsProvider')

  const fetchUserNotifications = async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      logger.debug('Skip fetching notifications', { reason: 'User not authenticated' })
      setNotifications([])
      setIsLoading(false)
      return
    }

    logger.info('Fetching notifications', { userId: user.id })
    setIsLoading(true)

    const { data, error: fetchError } = await tryCatch(async () => {
      return await fetchNotifications()
    })

    if (fetchError) {
      logger.error('Failed to fetch notifications', undefined, undefined, undefined, {
        error: fetchError,
      })
      setError(fetchError)
    } else {
      logger.info('Notifications fetched successfully', undefined, { count: data?.length || 0 })
      setNotifications(data || [])
      setError(null)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchUserNotifications()

    // Set up polling for notifications (every 60 seconds)
    const interval = setInterval(() => {
      fetchUserNotifications()
    }, 60000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  const markAsRead = async (notificationId: string): Promise<void> => {
    logger.info('Marking notification as read', undefined, undefined, { notificationId })

    // Optimistically update UI
    const previousNotifications = [...notifications]
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    )

    const { error: markError } = await tryCatch(async () => {
      await markNotificationAsRead(notificationId)
    })

    if (markError) {
      // Revert to previous state on error
      logger.error('Failed to mark notification as read', previousNotifications, notifications, {
        notificationId,
      })
      setNotifications(previousNotifications)

      // Show error notification
      markError.notify({
        title: 'Failed to update notification',
      })

      throw markError
    } else {
      logger.info('Notification marked as read successfully', undefined, undefined, {
        notificationId,
      })
    }
  }

  const markAllAsRead = async (): Promise<void> => {
    logger.info('Marking all notifications as read')

    // Optimistically update UI
    const previousNotifications = [...notifications]
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))

    const { error: markAllError } = await tryCatch(async () => {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
      })
    })

    if (markAllError) {
      // Revert to previous state on error
      logger.error('Failed to mark all notifications as read', previousNotifications, notifications)
      setNotifications(previousNotifications)

      // Show error notification
      markAllError.notify({
        title: 'Failed to update notifications',
      })

      throw markAllError
    } else {
      logger.info('All notifications marked as read successfully')
    }
  }

  // Calculate unread count
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  // Show toast notification
  const showToast = useCallback(
    (type: NotificationType, title: string, message?: string, options?: ToastOptions) => {
      const toastOptions = {
        duration: options?.duration || 5000,
        position: options?.position,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        dismissible: options?.dismissible !== false,
        important: options?.important || false,
        action: options?.action,
      }

      switch (type) {
        case 'success':
          return toast.success(title, { description: message, ...toastOptions })
        case 'error':
          return toast.error(title, { description: message, ...toastOptions })
        case 'warning':
          return toast.warning(title, { description: message, ...toastOptions })
        case 'info':
        default:
          return toast.info(title, { description: message, ...toastOptions })
      }
    },
    [],
  )

  // Dismiss toast notification
  const dismissToast = useCallback((toastId: string) => {
    toast.dismiss(toastId)
  }, [])

  // Add a new notification
  const addNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
      logger.info('Adding new notification', undefined, undefined, { notification })

      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification),
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to add notification')
        }

        // Refresh notifications
        await fetchUserNotifications()

        // Show toast for high priority notifications
        if (notification.priority === 'high' || notification.priority === 'urgent') {
          showToast(notification.type, notification.title, notification.message, {
            important: notification.priority === 'urgent',
          })
        }
      } catch (err) {
        logger.error('Failed to add notification', undefined, undefined, {
          notification,
          error: err,
        })
        throw err
      }
    },
    [logger, fetchUserNotifications, showToast],
  )

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: NotificationType) => {
      return notifications.filter((notification) => notification.type === type)
    },
    [notifications],
  )

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notification) => !notification.isRead)
  }, [notifications])

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetchNotifications: fetchUserNotifications,
    showToast,
    dismissToast,
    addNotification,
    getNotificationsByType,
    getUnreadNotifications,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
