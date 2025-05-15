'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { NotificationType as GlobalNotificationUIType } from '@/providers/NotificationsProvider' 
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { mapDbTypeToUiType } from '@/utilities/notifications'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Notification {
  id: string;
  title: string; 
  message?: string; 
  messageKey?: string; 
  messageParams?: Record<string, any>; 
  type: string; 
  isRead: boolean;
  createdAt: string | Date;
  link?: string;
}

export default function NotificationCenter() {
  const t = useTranslations('NotificationCenter')
  const tNotificationBodies = useTranslations('NotificationBodies');

  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [showOnlyUnread, setShowOnlyUnread] = useState(true)
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const { notifications, isLoading: loading, error } = useNotificationsList()
  const { markAsRead, markAllAsRead, refetchNotifications } = useNotificationActions()
  const { unreadCount } = useUnreadCount()

  const refetchNotificationsRef = React.useRef(refetchNotifications)
  useEffect(() => {
    refetchNotificationsRef.current = refetchNotifications
  }, [refetchNotifications])

  const loadNotifications = useCallback(
    async (page: number, unreadOnly: boolean, isLoadMoreAction = false) => {
      if (!refetchNotificationsRef.current) return

      if (isLoadMoreAction) {
        setIsFetchingMore(true)
      } else {
        setDisplayedNotifications([])
      }

      console.log(
        `NotificationCenter - Calling refetchNotifications from hook with page: ${page}, unreadOnly: ${unreadOnly}`,
      )
      try {
        // @ts-ignore 
        await refetchNotificationsRef.current(page, unreadOnly)
        setInitialLoadDone(true) 
      } catch (fetchError) {
        console.error('Error in loadNotifications:', fetchError)
      }

      if (isLoadMoreAction) {
        setIsFetchingMore(false)
      }
    },
    [],
  ) 

  useEffect(() => {
    if (user) { 
      console.log('NotificationCenter - Initial load or filter change. Fetching page 1. Unread:', showOnlyUnread)
      setCurrentPage(1) 
      loadNotifications(1, showOnlyUnread)
    }
  }, [showOnlyUnread, user, loadNotifications])


  useEffect(() => {
    if (!initialLoadDone && notifications.length === 0) {
      return;
    }

    if (currentPage === 1 && !isFetchingMore) {
      setDisplayedNotifications(notifications as Notification[]) 
    } else if (isFetchingMore) {
      setDisplayedNotifications((prev) => {
        const newNotifs = (notifications as Notification[]).filter(n => !prev.find(p => p.id === n.id));
        return [...prev, ...newNotifs];
      })
    }
    setHasMore(notifications.length === 20) 
  }, [notifications, initialLoadDone, currentPage, isFetchingMore])


  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && user) {
      console.log('NotificationCenter - Dropdown opened, refreshing. Page 1, Unread:', showOnlyUnread)
      setCurrentPage(1) 
      setInitialLoadDone(false); 
      loadNotifications(1, showOnlyUnread)
    }
  }

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      console.log('NotificationCenter - Loading more. Next Page:', nextPage, 'Unread:', showOnlyUnread)
      loadNotifications(nextPage, showOnlyUnread, true)
    }
  }

  const toggleShowOnlyUnread = () => {
    setShowOnlyUnread((prev) => !prev)
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

  const getNotificationIcon = (type: string) => {
    const uiType = mapDbTypeToUiType(type) as GlobalNotificationUIType 

    switch (uiType) {
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

  const navigateToNotificationsPage = () => {
    const pathname = window.location.pathname
    const lang = pathname.split('/')[1] || 'ru' 
    window.location.href = `/${lang}/notifications`
  }

  const getNotificationBodyText = (notification: Notification) => {
    if (notification.messageKey) {
      const keyWithoutNamespace = notification.messageKey.startsWith('NotificationBodies.')
        ? notification.messageKey.substring('NotificationBodies.'.length)
        : notification.messageKey;
      try {
        const translated = tNotificationBodies(keyWithoutNamespace, notification.messageParams || {});
        if (translated === keyWithoutNamespace || translated === notification.messageKey) {
          console.warn(`Translation not found for messageKey: ${keyWithoutNamespace} (original: ${notification.messageKey}) in NotificationBodies. Displaying key.`);
          return notification.messageKey; 
        }
        return translated;
      } catch (e) {
        console.warn(`Error translating messageKey: ${keyWithoutNamespace} in NotificationBodies. Falling back to raw key or message.`, e);
        return notification.messageKey || notification.message || '';
      }
    }
    return notification.message || ''; 
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

          <div className="p-2 border-b">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOnlyUnread"
                checked={showOnlyUnread}
                onCheckedChange={toggleShowOnlyUnread}
              />
              <Label htmlFor="showOnlyUnread" className="text-xs font-normal">
                {t('showOnlyUnread')}
              </Label>
            </div>
          </div>

          {loading && displayedNotifications.length === 0 && !isFetchingMore ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
              {t('loading')}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">
              {typeof error === 'string' ? error : t('errorLoading')}
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {displayedNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer ${
                    notification.isRead ? 'bg-background' : 'bg-muted/50 hover:bg-muted/75'
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium truncate">{notification.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {getNotificationBodyText(notification)}
                      </div>
                      <div className="text-xs text-muted-foreground/70 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 self-start flex-shrink-0"></div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              {isFetchingMore && (
                 <div className="p-2 text-center text-xs text-muted-foreground">{t('loadingMore')}</div>
              )}
              {!isFetchingMore && hasMore && displayedNotifications.length > 0 && (
                <DropdownMenuItem
                  className="p-2 justify-center text-sm font-medium sticky bottom-0 bg-background border-t"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                >
                  {t('loadMore')}
                </DropdownMenuItem>
              )}
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="p-2 justify-center text-sm font-medium"
              onClick={navigateToNotificationsPage}
            >
              {t('viewAll')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
