'use client'

import { useContext } from 'react'
import { NotificationsContext, NotificationsContextType } from '@/providers/NotificationsProvider'
import type { NotificationType } from '@/providers/NotificationsProvider'

/**
 * Custom hook to select specific parts of the notifications context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 *
 * @param selector A function that selects specific parts of the notifications context
 * @returns The selected parts of the notifications context
 */
export function useNotificationsSelector<T>(selector: (context: NotificationsContextType) => T): T {
  const context = useContext(NotificationsContext)

  if (context === undefined) {
    throw new Error('useNotificationsSelector must be used within a NotificationsProvider')
  }

  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the notifications list
 */
export function useNotificationsList() {
  return useNotificationsSelector((context) => ({
    notifications: context.notifications,
    isLoading: context.isLoadingInitial || context.isLoadingMore || context.isLoadingNew,
    error: context.error,
    hasMore: context.hasMore,
    loadMoreNotifications: context.loadMoreNotifications,
  }))
}

/**
 * Select only the toast notification functionality
 */
export function useToastNotifications() {
  return useNotificationsSelector((context) => ({
    showToast: context.showToast,
    dismissToast: context.dismissToast,
  }))
}

/**
 * Select only the notification actions
 */
export function useNotificationActions() {
  return useNotificationsSelector((context) => ({
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    addNotification: context.addNotification,
    refetchNotifications: context.refetchNotifications,
  }))
}

/**
 * Get the unread notification count
 */
export function useUnreadCount() {
  return useNotificationsSelector((context) => ({
    unreadCount: context.unreadCount,
  }))
}

/**
 * Get notifications of a specific type
 */
export function useNotificationsOfType(type: NotificationType) {
  return useNotificationsSelector((context) => ({
    notifications: context.getNotificationsByType(type),
    isLoading: context.isLoadingInitial || context.isLoadingMore,
    error: context.error,
  }))
}

/**
 * Группирует уведомления по типам с подсчетом количества в каждой группе
 * @returns Объект с группированными уведомлениями и метаданными групп
 */
export function useGroupedNotifications() {
  return useNotificationsSelector((context) => {
    const { notifications } = context

    // Группируем уведомления по типу
    const groupedByType = notifications.reduce(
      (groups, notification) => {
        const type = notification.type
        if (!groups[type]) {
          groups[type] = {
            type,
            items: [],
            count: 0,
            unreadCount: 0,
            latestTimestamp: '',
          }
        }

        groups[type].items.push(notification)
        groups[type].count += 1
        if (!notification.isRead) {
          groups[type].unreadCount += 1
        }

        // Обновляем timestamp на самый последний в группе
        const notificationTimestamp = notification.createdAt
        if (
          !groups[type].latestTimestamp ||
          new Date(notificationTimestamp) > new Date(groups[type].latestTimestamp)
        ) {
          groups[type].latestTimestamp = notificationTimestamp
        }

        return groups
      },
      {} as Record<
        string,
        {
          type: string
          items: any[]
          count: number
          unreadCount: number
          latestTimestamp: string
        }
      >,
    )

    // Преобразуем в массив и сортируем по времени (самые новые сверху)
    const groupsArray = Object.values(groupedByType).sort(
      (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime(),
    )

    return {
      groups: groupsArray,
      isLoading: context.isLoadingInitial || context.isLoadingMore || context.isLoadingNew,
      error: context.error,
      hasMoreGroups: context.hasMore,
      loadMoreNotifications: context.loadMoreNotifications,
      totalGroups: groupsArray.length,
      totalNotifications: notifications.length,
      totalUnreadCount: context.unreadCount,
    }
  })
}
