'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { fetchNotifications, markNotificationAsRead } from '@/lib/api/notifications'
import { useTranslations } from 'next-intl'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, any>
}

export default function NotificationCenter() {
  const t = useTranslations('NotificationCenter')
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return

      try {
        setLoading(true)
        const data = await fetchNotifications()
        setNotifications(data)
      } catch (err) {
        console.error('Error loading notifications:', err)
        setError(t('errorLoading'))
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()

    // Обновляем уведомления каждые 30 секунд, если меню открыто
    const interval = setInterval(() => {
      if (isOpen) {
        loadNotifications()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user, isOpen, t])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)

      // Обновляем локальное состояние
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆'
      case 'level_up':
        return '⭐'
      case 'course_completed':
        return '🎓'
      case 'certificate':
        return '📜'
      default:
        return '📣'
    }
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t('title')}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-semibold border-b">{t('title')}</div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">{t('loading')}</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">{t('noNotifications')}</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer ${
                  notification.isRead ? 'bg-white' : 'bg-blue-50'
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-gray-600">{notification.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
