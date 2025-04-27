'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Trophy,
  Settings,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useNotificationsList, useNotificationActions, useUnreadCount } from '@/hooks/useContexts'
import { NotificationType } from '@/providers/NotificationsProvider'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function NotificationCenter() {
  const t = useTranslations('NotificationCenter')
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Use selector hooks for better performance
  const { notifications, isLoading: loading, error } = useNotificationsList()
  const { markAsRead, markAllAsRead, refetchNotifications } = useNotificationActions()
  const { unreadCount } = useUnreadCount()

  // When dropdown opens, refresh notifications
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      refetchNotifications()
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type as NotificationType) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'achievement':
        return <Trophy className="h-4 w-4 text-purple-500" />
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  if (!user) {
    return null
  }

  return (
    <TooltipProvider>
      <DropdownMenu onOpenChange={handleOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label={t('title')}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('title')}</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2 border-b">
            <DropdownMenuLabel className="p-0">{t('title')}</DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleMarkAllAsRead}
              >
                {t('markAllAsRead')}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
              {t('loading')}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">{error.toString()}</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer ${
                    notification.isRead ? 'bg-background' : 'bg-muted/50'
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.message}</div>
                      <div className="text-xs text-muted-foreground/70 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="p-2 justify-center text-sm font-medium"
              onClick={() => (window.location.href = `/${user?.language || 'en'}/notifications`)}
            >
              {t('viewAll')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
