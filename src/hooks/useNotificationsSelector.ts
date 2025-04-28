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
 * Select only the notifications list and count
 */
export function useNotificationsList() {
  return useNotificationsSelector((context) => ({
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    isLoading: context.isLoading,
    error: context.error,
    getNotificationsByType: context.getNotificationsByType,
    getUnreadNotifications: context.getUnreadNotifications,
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
 * Select only the unread count
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
    isLoading: context.isLoading,
    error: context.error,
  }))
}
