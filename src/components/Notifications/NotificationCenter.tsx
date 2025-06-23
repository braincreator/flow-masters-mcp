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
import {
  useNotificationsList,
  useNotificationActions,
  useUnreadCount,
  useNotificationsFilter,
} from '@/hooks/useContexts'
import { NotificationType as GlobalNotificationUIType } from '@/providers/NotificationsProvider'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { mapDbTypeToUiType } from '@/utilities/notifications'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import NotificationItem from '@/components/Notifications/NotificationItem'
import { cn } from '@/lib/utils'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Notification {
  id: string
  title: string
  message?: string
  messageKey?: string
  messageParams?: Record<string, any>
  type: string
  isRead: boolean
  createdAt: string | Date
  link?: string
}

export default function NotificationCenter() {
  const t = useTranslations('NotificationCenter')
  const tNotificationBodies = useTranslations('NotificationBodies')

  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.split('/')[1] || 'ru'
    }
    return 'ru'
  })

  // Добавляем локальное состояние для индикации загрузки
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { showOnlyUnreadFilter, setShowOnlyUnreadFilter } = useNotificationsFilter()
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const [showOnlyUnread, setShowOnlyUnread] = useState(showOnlyUnreadFilter)

  const { notifications, isLoading: loading, error } = useNotificationsList()
  const { markAsRead, markAllAsRead, refetchNotifications } = useNotificationActions()
  const { unreadCount } = useUnreadCount()

  const refetchNotificationsRef = React.useRef(refetchNotifications)
  useEffect(() => {
    refetchNotificationsRef.current = refetchNotifications
  }, [refetchNotifications])

  const loadNotifications = useCallback(
    async (page: number, unreadOnly: boolean, isLoadMoreAction = false) => {
      if (!refetchNotificationsRef.current) {
        logError('NotificationCenter - refetchNotifications is not available')
        return
      }

      if (isLoadMoreAction) {
        setIsFetchingMore(true)
      } else {
        setDisplayedNotifications([])
      }

      logDebug(`NotificationCenter - Loading notifications. Page: ${page}, UnreadOnly: ${unreadOnly}, IsLoadMore: ${isLoadMoreAction}`,  )

      try {
        // Передаем параметры page и unreadOnly
        await refetchNotificationsRef.current(page, unreadOnly)
        logDebug('NotificationCenter - Notifications loaded successfully')
        setInitialLoadDone(true)
      } catch (fetchError) {
        logError('Error in loadNotifications:', fetchError)
      }

      if (isLoadMoreAction) {
        setIsFetchingMore(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (user && initialLoadDone === false) {
      logDebug('NotificationCenter - Initial load. Fetching page 1. Unread:', showOnlyUnread)
      loadNotifications(1, showOnlyUnread)
    }
  }, [user, initialLoadDone, loadNotifications])

  useEffect(() => {
    if (!initialLoadDone && notifications.length === 0) {
      return
    }

    if (currentPage === 1 && !isFetchingMore) {
      setDisplayedNotifications(notifications as Notification[])
    } else if (isFetchingMore) {
      setDisplayedNotifications((prev) => {
        const newNotifs = (notifications as Notification[]).filter(
          (n) => !prev.find((p) => p.id === n.id),
        )
        return [...prev, ...newNotifs]
      })
    }
    setHasMore(notifications.length === 20)
  }, [notifications, initialLoadDone, currentPage, isFetchingMore])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentLang = window.location.pathname.split('/')[1] || 'ru'
      setLang(currentLang)
    }
  }, [])

  // Синхронизация локального состояния showOnlyUnread с глобальным showOnlyUnreadFilter
  useEffect(() => {
    // Обновляем локальное состояние, когда изменяется глобальное
    setShowOnlyUnread(showOnlyUnreadFilter)
  }, [showOnlyUnreadFilter])

  // Обновляем существующий эффект, который загружает уведомления при изменении фильтра
  useEffect(() => {
    if (user && initialLoadDone === false) {
      logDebug('NotificationCenter - Initial load. Fetching page 1. Unread:', showOnlyUnread)

      // Определяем параметр status для API
      const status = showOnlyUnread ? 'unread' : undefined

      if (refetchNotificationsRef.current) {
        refetchNotificationsRef
          .current(1, showOnlyUnread, status)
          .catch((error) => logError('Error loading notifications on mount:', error))
      }
    }
  }, [user, initialLoadDone, showOnlyUnread, refetchNotificationsRef])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && user) {
      logDebug('NotificationCenter - Dropdown opened, refreshing. Page 1, Unread:', showOnlyUnread,
      )

      setCurrentPage(1)
      setInitialLoadDone(false)
      setDisplayedNotifications([]) // Очищаем уведомления перед новой загрузкой

      // Обновляем глобальное состояние фильтра
      if (showOnlyUnreadFilter !== showOnlyUnread) {
        setShowOnlyUnreadFilter(showOnlyUnread)
      }

      // Определяем параметр status для API
      const status = showOnlyUnread ? 'unread' : undefined

      // Используем refetchNotifications с явно указанными параметрами
      if (refetchNotificationsRef.current) {
        refetchNotificationsRef
          .current(1, showOnlyUnread, status)
          .then(() => logDebug('NotificationCenter - Notifications refreshed on open'))
          .catch((error) => logError('Error refreshing notifications on open:', error))
      }
    }
  }

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)

      logDebug('NotificationCenter - Loading more. Next Page:', nextPage,
        'Unread:',
        showOnlyUnread,
      )

      setIsFetchingMore(true)

      // Определяем параметр status для API
      const status = showOnlyUnread ? 'unread' : undefined

      if (refetchNotificationsRef.current) {
        refetchNotificationsRef
          .current(nextPage, showOnlyUnread, status)
          .then(() => {
            logDebug('NotificationCenter - Additional notifications loaded successfully')
            setIsFetchingMore(false)
          })
          .catch((error) => {
            logError('Error loading more notifications:', error)
            setIsFetchingMore(false)
          })
      } else {
        logError('NotificationCenter - refetchNotifications is not available for loading more')
        setIsFetchingMore(false)
      }
    }
  }

  const toggleShowOnlyUnread = async (checked: boolean) => {
    logDebug('NotificationCenter - Toggling unread filter:', checked)

    // Показываем состояние загрузки
    setIsLoadingInitial(true)

    // Обновляем локальное состояние
    setShowOnlyUnread(checked)

    // Обновляем глобальное состояние
    setShowOnlyUnreadFilter(checked)

    // Сбрасываем состояние пагинации
    setCurrentPage(1)
    setInitialLoadDone(false)

    // Очищаем текущие уведомления для индикации загрузки
    setDisplayedNotifications([])

    try {
      // Определяем параметр status для API
      const status = checked ? 'unread' : null

      // Прямой вызов API для получения отфильтрованных уведомлений
      const response = await fetch(
        `/api/notifications?limit=20&page=1&onlyUnread=${checked}${status ? `&status=${status}` : ''}`,
        {
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error(`API ответил с кодом: ${response.status}`)
      }

      const data = await response.json()
      logDebug('NotificationCenter - Получены новые отфильтрованные уведомления:', data)

      // Обновляем отображаемые уведомления
      if (data && data.items) {
        setDisplayedNotifications(data.items)
        setHasMore(data.currentPage < data.totalPages)
      } else {
        setDisplayedNotifications([])
        setHasMore(false)
      }

      // Также обновляем через контекст для поддержания согласованности
      if (refetchNotificationsRef.current) {
        // Передаем параметр status для согласованности с API
        await refetchNotificationsRef.current(1, checked, status || undefined)
      }

      logDebug('NotificationCenter - Фильтр успешно применен')
    } catch (error) {
      logError('Ошибка при применении фильтра:', error)
    } finally {
      // Завершаем загрузку
      setIsLoadingInitial(false)
      setInitialLoadDone(true)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch (err) {
      logError('Error marking notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (err) {
      logError('Error marking all notifications as read:', err)
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
        : notification.messageKey
      try {
        const translated = tNotificationBodies(
          keyWithoutNamespace,
          notification.messageParams || {},
        )
        if (translated === keyWithoutNamespace || translated === notification.messageKey) {
          logWarn(
            `Translation not found for messageKey: ${keyWithoutNamespace} (original: ${notification.messageKey}) in NotificationBodies. Displaying key.`,
          )
          return notification.messageKey
        }
        return translated
      } catch (e) {
        logWarn(
          `Error translating messageKey: ${keyWithoutNamespace} in NotificationBodies. Falling back to raw key or message.`,
          e,
        )
        return notification.messageKey || notification.message || ''
      }
    }
    return notification.message || ''
  }

  // Создаем переопределенные обработчики, которые предотвращают всплытие события
  const handlePreventPropagation = (e: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
  }

  // Обновляем обработчики с проверками на событие
  const handleNotificationMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      handlePreventPropagation(e)
    }
    try {
      await markAsRead(id)
    } catch (err) {
      logError('Error marking notification as read:', err)
    }
  }

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors hover:bg-accent/50 rounded-full w-9 h-9"
                aria-label={t('title')}
              >
                <Bell className="h-[1.3rem] w-[1.3rem]" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center p-0 text-[0.7rem] font-bold"
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

        <DropdownMenuContent
          align="end"
          className="w-96 p-0 max-h-[80vh] overflow-hidden"
          sideOffset={8}
        >
          <div className="sticky top-0 z-10 bg-background flex items-center justify-between p-3 border-b">
            <DropdownMenuLabel className="p-0 text-base font-medium">
              {t('title')}
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-3 hover:bg-accent/50 font-medium"
                onClick={handleMarkAllAsRead}
              >
                {t('markAllAsRead')}
              </Button>
            )}
          </div>

          <div className="sticky top-[49px] z-10 bg-background p-3 border-b">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="showOnlyUnread"
                checked={showOnlyUnread}
                onCheckedChange={(value) => {
                  const isChecked = value === true
                  toggleShowOnlyUnread(isChecked)
                }}
                disabled={isLoadingInitial}
              />
              <Label
                htmlFor="showOnlyUnread"
                className={cn('text-sm font-normal', isLoadingInitial && 'text-muted-foreground')}
              >
                {t('showOnlyUnread')}
              </Label>

              {isLoadingInitial && (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full ml-2"></div>
              )}
            </div>
          </div>

          {loading &&
          displayedNotifications.length === 0 &&
          !isFetchingMore &&
          !isLoadingInitial ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm">{t('loading')}</p>
            </div>
          ) : isLoadingInitial && displayedNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm">{t('filtering')}</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              <AlertTriangle className="h-7 w-7 mx-auto mb-3 opacity-70" />
              <p className="text-sm">{typeof error === 'string' ? error : t('errorLoading')}</p>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Bell className="mx-auto h-10 w-10 mb-4 opacity-50" />
              <p className="text-sm">{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="overflow-y-auto overscroll-contain px-2 py-2 flex flex-col gap-2">
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="notification-dropdown-item overflow-hidden rounded-md bg-background/80 transition-colors group hover:bg-accent/50"
                  onClick={async (e) => {
                    const target = e.target as HTMLElement

                    // Если клик был на кнопку или внутри кнопки, не обрабатываем
                    if (target.closest('button') || target.tagName === 'BUTTON') {
                      return
                    }

                    if (!notification.isRead) {
                      try {
                        await markAsRead(notification.id)
                      } catch (error) {
                        logError('Error marking notification as read on click:', error)
                      }
                    }

                    if (notification.link) {
                      window.location.href = notification.link
                    }

                    setIsOpen(false) // Закрываем модальное окно после клика
                  }}
                >
                  <NotificationItem
                    notification={{
                      id: notification.id,
                      title: notification.title,
                      messageKey: notification.messageKey,
                      messageParams: notification.messageParams,
                      shortText: notification.message,
                      fullText: notification.message,
                      receivedAt: '',
                      type: notification.type as any,
                      status: notification.isRead ? 'read' : 'unread',
                      link: notification.link,
                      createdAt: notification.createdAt as string,
                    }}
                    onMarkAsRead={(id) => handleNotificationMarkAsRead(id)}
                    onMarkAsUnread={async () => {}}
                    onDelete={async () => {}}
                    lang={lang}
                    variant="compact"
                    disableClickEvents={true}
                  />
                </div>
              ))}
              {isFetchingMore && (
                <div className="p-3 text-center text-muted-foreground border-t bg-muted/20">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                  <p className="text-xs">{t('loadingMore')}</p>
                </div>
              )}
              {!isFetchingMore && hasMore && displayedNotifications.length > 0 && (
                <DropdownMenuItem
                  className="p-3 justify-center text-xs font-medium sticky bottom-0 bg-background border-t hover:bg-accent/70"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                >
                  {t('loadMore')}
                </DropdownMenuItem>
              )}
            </div>
          )}
          <DropdownMenuSeparator className="mb-0" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="p-3 justify-center text-sm font-medium bg-muted/10 hover:bg-accent/70"
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
