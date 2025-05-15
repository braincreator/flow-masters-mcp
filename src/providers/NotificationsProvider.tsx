'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import {
  fetchNotifications,
  markNotificationAsRead,
} from '@/lib/api/notifications'
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
  message: string // This will be changed to messageKey and messageParams later
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
  notifications: Notification[]
  unreadCount: number
  isLoadingInitial: boolean
  isLoadingMore: boolean
  isLoadingNew: boolean
  error: AppError | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refetchNotifications: () => Promise<void>
  loadMoreNotifications: () => Promise<void>
  hasMore: boolean
  currentPage: number
  showOnlyUnreadFilter: boolean
  setShowOnlyUnreadFilter: (value: boolean) => void
  lastFetchedTimestamp: string | null

  showToast: (
    type: NotificationType,
    title: string,
    message?: string,
    options?: ToastOptions,
  ) => void
  dismissToast: (toastId: string) => void

  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>,
  ) => Promise<void>

  getNotificationsByType: (type: NotificationType) => Notification[]
  getUnreadNotifications: () => Notification[]
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const logger = useStateLogger('NotificationsProvider')

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [isLoadingNew, setIsLoadingNew] = useState<boolean>(false)
  const [error, setError] = useState<AppError | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [showOnlyUnreadFilter, setShowOnlyUnreadFilter] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState<string | null>(null)

  const NOTIFICATION_LIMIT = 20
  const POLLING_INTERVAL = 30000 

  type FetchType = 'initial' | 'loadMore' | 'fetchNewer' | 'filterChange'

  const fetchUserNotifications = useCallback(
    async (fetchType: FetchType, pageToFetch: number = 1): Promise<void> => {
      if (!isAuthenticated || !user?.id) {
        logger.debug('Skip fetching notifications', { reason: 'User not authenticated or no user ID' })
        setNotifications([])
        setIsLoadingInitial(false)
        setIsLoadingMore(false)
        setIsLoadingNew(false)
        setHasMore(false)
        setCurrentPage(1)
        setLastFetchedTimestamp(null)
        return
      }

      logger.info(`Fetching notifications`, {
        userId: user.id,
        fetchType,
        page: pageToFetch,
        unreadOnly: showOnlyUnreadFilter,
        lastTimestamp: fetchType === 'fetchNewer' ? lastFetchedTimestamp : undefined,
      })

      if (fetchType === 'initial' || fetchType === 'filterChange') setIsLoadingInitial(true)
      if (fetchType === 'loadMore') setIsLoadingMore(true)
      if (fetchType === 'fetchNewer') setIsLoadingNew(true)

      const params: {
        limit: number
        page: number
        unreadOnly: boolean
        newerThanTimestamp?: string
      } = {
        limit: NOTIFICATION_LIMIT,
        page: pageToFetch,
        unreadOnly: showOnlyUnreadFilter,
      }

      if (fetchType === 'fetchNewer' && lastFetchedTimestamp) {
        params.newerThanTimestamp = lastFetchedTimestamp
        params.page = 1 
      }

      const { data, error: fetchError } = await tryCatch(async () => {
        // @ts-ignore 
        return fetchNotifications(params.limit, params.page, params.unreadOnly, params.newerThanTimestamp)
      })

      if (fetchError) {
        logger.error('Failed to fetch notifications', undefined, undefined, undefined, {
          error: fetchError,
          fetchType,
        })
        setError(fetchError)
        if (fetchType === 'initial' || fetchType === 'filterChange') {
          setNotifications([])
          setHasMore(false)
          setLastFetchedTimestamp(null)
        }
      } else {
        const newNotificationsData = data?.items || [] // Updated to use data.items
        logger.info('Notifications fetched successfully', undefined, {
          count: newNotificationsData.length,
          fetchType,
          page: data?.currentPage || params.page, // Use API's current page
          totalPages: data?.totalPages, // Log total pages
        })

        let newestTimestampInBatch: string | null = null
        if (newNotificationsData.length > 0) {
          const sortedNew = [...newNotificationsData].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          newestTimestampInBatch = sortedNew[0].createdAt
        }

        if (fetchType === 'initial' || fetchType === 'filterChange') {
          setNotifications(newNotificationsData)
          setCurrentPage(data?.currentPage || 1)
          setHasMore(data ? data.currentPage < data.totalPages : false) // Updated hasMore logic
          if (newestTimestampInBatch) {
            setLastFetchedTimestamp(newestTimestampInBatch)
          }
        } else if (fetchType === 'loadMore') {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id))
            const uniqueNewNotifications = newNotificationsData.filter(
              (n: Notification) => !existingIds.has(n.id),
            )
            return [...prev, ...uniqueNewNotifications]
          })
          setCurrentPage(data?.currentPage || params.page)
          setHasMore(data ? data.currentPage < data.totalPages : false) // Updated hasMore logic
        } else if (fetchType === 'fetchNewer') {
          if (newNotificationsData.length > 0) {
            setNotifications((prev) => {
              const existingIds = new Set(prev.map((n) => n.id))
              const uniqueNewNotifications = newNotificationsData.filter(
                (n: Notification) => !existingIds.has(n.id),
              )
              return [...uniqueNewNotifications, ...prev]
            })
            if (newestTimestampInBatch) {
              setLastFetchedTimestamp(newestTimestampInBatch)
            }
          }
        }
        setError(null)
      }

      if (fetchType === 'initial' || fetchType === 'filterChange') setIsLoadingInitial(false)
      if (fetchType === 'loadMore') setIsLoadingMore(false)
      if (fetchType === 'fetchNewer') setIsLoadingNew(false)
    },
    [
      isAuthenticated,
      user?.id, 
      logger, 
      showOnlyUnreadFilter, 
      lastFetchedTimestamp, 
      NOTIFICATION_LIMIT, 
    ],
  )

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      logger.info('Auth or filter state changed, fetching initial notifications', {
        unread: showOnlyUnreadFilter,
      })
      fetchUserNotifications('initial', 1)
    } else if (!isAuthenticated) {
      logger.info('User logged out, clearing notifications data')
      setNotifications([])
      setCurrentPage(1)
      setHasMore(true) 
      setError(null)
      setIsLoadingInitial(false)
      setIsLoadingMore(false)
      setIsLoadingNew(false)
      setLastFetchedTimestamp(null)
    }
  }, [isAuthenticated, user?.id, showOnlyUnreadFilter, logger, fetchUserNotifications])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return () => {} 
    }

    logger.info('Setting up polling for new notifications', { interval: POLLING_INTERVAL })
    const intervalId = setInterval(() => {
      logger.info('Polling for newer notifications')
      fetchUserNotifications('fetchNewer')
    }, POLLING_INTERVAL)

    return () => {
      logger.info('Clearing polling interval for new notifications')
      clearInterval(intervalId)
    }
  }, [isAuthenticated, user?.id, logger, POLLING_INTERVAL, fetchUserNotifications])

  const markAsRead = async (notificationId: string): Promise<void> => {
    logger.info('Marking notification as read', undefined, undefined, { notificationId })

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
      logger.error('Failed to mark notification as read', previousNotifications, notifications, {
        notificationId,
      })
      setNotifications(previousNotifications)

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

    const previousNotifications = [...notifications]
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))

    const { error: markAllError } = await tryCatch(async () => {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
      })
    })

    if (markAllError) {
      logger.error('Failed to mark all notifications as read', previousNotifications, notifications)
      setNotifications(previousNotifications)

      markAllError.notify({
        title: 'Failed to update notifications',
      })

      throw markAllError
    } else {
      logger.info('All notifications marked as read successfully')
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

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

  const dismissToast = useCallback((toastId: string) => {
    toast.dismiss(toastId)
  }, [])

  const addNotification = useCallback(
    async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
      logger.info('Attempting to add new notification via API', { notificationData })

      const { data: createdNotification, error: createError } = await tryCatch(async () => {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData),
          credentials: 'include',
        })
        if (!response.ok) {
          const errorBody = await response.text()
          throw new AppError({
            message: `Server responded with ${response.status}: ${errorBody}`,
            type: ErrorType.NETWORK, // Or a more specific type if determinable
            severity: ErrorSeverity.ERROR,
            statusCode: response.status,
          })
        }
        return response.json()
      })

      if (createError) {
        logger.error('Failed to add notification to server', undefined, undefined, undefined, {
          error: createError,
        })
        createError.notify({ title: 'Error Creating Notification' })
        throw createError
      }

      logger.info('Notification created on server, now fetching newer notifications', {
        createdNotificationId: createdNotification?.id,
      })

      await fetchUserNotifications('fetchNewer')

      if (
        notificationData.priority === 'high' ||
        notificationData.priority === 'urgent' ||
        createdNotification?.priority === 'high' ||
        createdNotification?.priority === 'urgent'
      ) {
        showToast(
          createdNotification?.type || notificationData.type,
          createdNotification?.title || notificationData.title,
          createdNotification?.message || notificationData.message,
          {
            important:
              notificationData.priority === 'urgent' || createdNotification?.priority === 'urgent',
          },
        )
      }
    },
    [logger, showToast, fetchUserNotifications],
  )

  const getNotificationsByType = useCallback(
    (type: NotificationType) => {
      return notifications.filter((notification) => notification.type === type)
    },
    [notifications],
  )

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notification) => !notification.isRead)
  }, [notifications])

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoadingInitial,
    isLoadingMore,
    isLoadingNew,
    error,
    markAsRead,
    markAllAsRead,
    refetchNotifications: async () => {
      logger.info('Manual refresh triggered (refetchNotifications)')
      await fetchUserNotifications('initial', 1)
    },
    loadMoreNotifications: async () => {
      if (hasMore && !isLoadingInitial && !isLoadingMore && !isLoadingNew) {
        logger.info('Loading more notifications')
        await fetchUserNotifications('loadMore', currentPage + 1)
      } else {
        logger.debug('Skipped loading more', { hasMore, isLoadingInitial, isLoadingMore, isLoadingNew })
      }
    },
    hasMore,
    currentPage,
    showOnlyUnreadFilter,
    setShowOnlyUnreadFilter: (newFilterValue: boolean) => {
      logger.info('Filter changed', { newFilterValue })
      setShowOnlyUnreadFilter(newFilterValue)
    },
    lastFetchedTimestamp,
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
