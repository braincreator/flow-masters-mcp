'use client'

import { useState, useEffect } from 'react'
import { fetchNotifications } from '@/lib/api/notifications'

interface UseNotificationsReturn {
  unreadCount: number
  notifications: any[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUserNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const data = await fetchNotifications()
      setNotifications(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserNotifications()
  }, [])

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.isRead).length

  return {
    unreadCount,
    notifications,
    isLoading,
    error,
    refetch: fetchUserNotifications
  }
}
