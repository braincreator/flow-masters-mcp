'use client'

import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import { useTranslations } from 'next-intl'
import { useIntersection } from '@/hooks/useIntersection'
import { NotificationStoredType } from '@/types/notifications'
import NotificationItem from './NotificationItem'
import NotificationSkeletonItem from './NotificationSkeletonItem'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

export interface Notification {
  id: string
  title: string
  messageKey?: string
  messageParams?: Record<string, any>
  shortText?: string
  fullText?: string
  receivedAt: string
  type: NotificationStoredType
  status: 'read' | 'unread'
  link?: string
  createdAt: string
  isDeleting?: boolean
}

interface InfiniteNotificationsListProps {
  fetchNotifications: (page: number) => Promise<{
    items: Notification[]
    hasMore: boolean
    totalCount?: number
  }>
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAsUnread: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  filters: { type: string; status: string }
  sort: { sortBy: string; sortOrder: 'asc' | 'desc' }
  lang: string
}

// Определяем отдельные мемоизированные компоненты для лучшей производительности
const EmptyState = memo(({ t }: { t: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center text-center py-10 md:py-20 min-h-[calc(100vh-20rem)]"
  >
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 text-gray-400 dark:text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {t('emptyState.title')}
      </h3>
      <p className="text-muted-foreground max-w-md">{t('emptyState.message')}</p>
    </div>
  </motion.div>
))
EmptyState.displayName = 'EmptyState'

// Мемоизированный компонент для элемента списка уведомлений
const NotificationListItem = memo(
  ({
    notification,
    onMarkAsRead,
    onMarkAsUnread,
    onDelete,
    lang,
    isProcessing,
  }: {
    notification: Notification
    onMarkAsRead: (id: string) => Promise<void>
    onMarkAsUnread: (id: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
    lang: string
    isProcessing: boolean
  }) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: notification.isDeleting ? 0 : 1,
        y: notification.isDeleting ? -10 : 0,
        scale: notification.isDeleting ? 0.9 : 1,
      }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{
        duration: 0.3,
        opacity: { duration: 0.2 },
        scale: { duration: 0.25 },
      }}
      layout="position"
    >
      <NotificationItem
        notification={notification}
        onMarkAsRead={onMarkAsRead}
        onMarkAsUnread={onMarkAsUnread}
        onDelete={onDelete}
        lang={lang}
        isProcessing={isProcessing}
      />
    </motion.div>
  ),
)
NotificationListItem.displayName = 'NotificationListItem'

// Основной компонент списка уведомлений
const InfiniteNotificationsList: React.FC<InfiniteNotificationsListProps> = ({
  fetchNotifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  filters,
  sort,
  lang,
}) => {
  const t = useTranslations('Notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({})

  // Ref для обнаружения конца списка
  const endOfListRef = useRef<HTMLDivElement>(null)

  // Мемоизируем обработчик повторной загрузки для предотвращения ненужных ререндеров
  const handleRetry = useCallback(() => {
    setError(null)
    if (currentPage > 1) {
      // Повторить загрузку текущей страницы
      setCurrentPage(currentPage - 1)
      setHasMore(true)
    } else {
      // Перезагрузить с начала
      setIsInitialLoad(true)
    }
  }, [currentPage])

  // Используем IntersectionObserver для определения, когда пользователь достиг конца списка
  const isIntersecting = useIntersection(endOfListRef as React.RefObject<Element>, {
    root: null,
    rootMargin: '200px', // Загружаем заранее, когда пользователь приближается к концу списка
    threshold: 0.1,
  })

  // Сбрасываем состояние при изменении фильтров или сортировки
  useEffect(() => {
    setNotifications([])
    setCurrentPage(1)
    setHasMore(true)
    setIsInitialLoad(true)
  }, [filters, sort])

  // Загружаем начальные данные или при изменении фильтров/сортировки
  useEffect(() => {
    let isMounted = true // Для предотвращения утечек памяти

    const loadInitialData = async () => {
      if (isInitialLoad) {
        setIsLoading(true)
        setError(null)
        try {
          const data = await fetchNotifications(1)
          if (isMounted) {
            setNotifications(data.items)
            setHasMore(data.hasMore)
          }
        } catch (err) {
          console.error('Failed to load initial notifications:', err)
          if (isMounted) {
            setError(err instanceof Error ? err.message : t('errors.unknown'))
          }
        } finally {
          if (isMounted) {
            setIsLoading(false)
            setIsInitialLoad(false)
          }
        }
      }
    }

    loadInitialData()

    // Очистка при размонтировании
    return () => {
      isMounted = false
    }
  }, [fetchNotifications, isInitialLoad, t])

  // Загружаем больше данных при достижении конца списка
  useEffect(() => {
    let isMounted = true

    const loadMoreData = async () => {
      if (isIntersecting && !isLoading && hasMore && !isInitialLoad) {
        setIsLoading(true)
        setError(null)
        try {
          const nextPage = currentPage + 1
          const data = await fetchNotifications(nextPage)

          if (isMounted) {
            setNotifications((prev) => [...prev, ...data.items])
            setHasMore(data.hasMore)
            setCurrentPage(nextPage)
          }
        } catch (err) {
          console.error('Failed to load more notifications:', err)
          if (isMounted) {
            setError(err instanceof Error ? err.message : t('errors.loadMoreFailed'))
          }
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }
    }

    loadMoreData()

    return () => {
      isMounted = false
    }
  }, [isIntersecting, isLoading, hasMore, currentPage, fetchNotifications, isInitialLoad, t])

  // Улучшенные обработчики с оптимистичными обновлениями
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      // Находим уведомление
      const notification = notifications.find((n) => n.id === id)
      if (!notification) return

      // Мгновенно добавляем в обрабатываемые
      setProcessingIds((prev) => ({ ...prev, [id]: true }))

      // Оптимистично обновляем UI еще до вызова API
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => (n.id === id ? { ...n, status: 'read' } : n)),
      )

      try {
        // Делаем запрос к API после обновления UI
        await onMarkAsRead(id)

        // Если фильтр установлен только на непрочитанные, уведомление нужно скрыть с анимацией
        if (filters.status === 'unread') {
          // Небольшая задержка для анимации
          setTimeout(() => {
            setNotifications((prevNotifications) => prevNotifications.filter((n) => n.id !== id))
          }, 300)
        }

        toast({
          description: t('readSuccess'),
          variant: 'default',
          duration: 1500,
        })
      } catch (error) {
        console.error('Error marking as read:', error)
        // Возвращаем статус обратно в случае ошибки
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) => (n.id === id ? { ...n, status: 'unread' } : n)),
        )
        toast({
          description: t('errors.markReadFailed'),
          variant: 'destructive',
        })
      } finally {
        // Задержка для завершения анимации
        setTimeout(() => {
          setProcessingIds((prev) => {
            const newState = { ...prev }
            delete newState[id]
            return newState
          })
        }, 300)
      }
    },
    [onMarkAsRead, notifications, filters.status, t],
  )

  const handleMarkAsUnread = useCallback(
    async (id: string) => {
      // Находим уведомление
      const notification = notifications.find((n) => n.id === id)
      if (!notification) return

      // Мгновенно добавляем в обрабатываемые
      setProcessingIds((prev) => ({ ...prev, [id]: true }))

      // Оптимистично обновляем UI еще до вызова API
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => (n.id === id ? { ...n, status: 'unread' } : n)),
      )

      try {
        // Делаем запрос к API после обновления UI
        await onMarkAsUnread(id)

        // Если фильтр установлен только на прочитанные, уведомление нужно скрыть с анимацией
        if (filters.status === 'read') {
          // Небольшая задержка для анимации
          setTimeout(() => {
            setNotifications((prevNotifications) => prevNotifications.filter((n) => n.id !== id))
          }, 300)
        }

        toast({
          description: t('unreadSuccess'),
          variant: 'default',
          duration: 1500,
        })
      } catch (error) {
        console.error('Error marking as unread:', error)
        // Возвращаем статус обратно в случае ошибки
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) => (n.id === id ? { ...n, status: 'read' } : n)),
        )
        toast({
          description: t('errors.markUnreadFailed'),
          variant: 'destructive',
        })
      } finally {
        // Задержка для завершения анимации
        setTimeout(() => {
          setProcessingIds((prev) => {
            const newState = { ...prev }
            delete newState[id]
            return newState
          })
        }, 300)
      }
    },
    [onMarkAsUnread, notifications, filters.status, t],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      // Находим уведомление
      const notification = notifications.find((n) => n.id === id)
      if (!notification) return

      // Мгновенно добавляем в обрабатываемые
      setProcessingIds((prev) => ({ ...prev, [id]: true }))

      // Оптимистично обновляем UI - делаем визуально "исчезающим" до вызова API
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => (n.id === id ? { ...n, isDeleting: true } : n)),
      )

      // Небольшая задержка перед удалением из DOM для анимации
      setTimeout(() => {
        setNotifications((prevNotifications) => prevNotifications.filter((n) => n.id !== id))
      }, 200)

      try {
        // Делаем запрос к API после обновления UI
        await onDelete(id)

        toast({
          description: t('deleteSuccess'),
          variant: 'default',
          duration: 1500,
        })
      } catch (error) {
        console.error('Error deleting notification:', error)
        // Перезагружаем данные в случае ошибки
        setIsInitialLoad(true)
        toast({
          description: t('errors.deleteFailed'),
          variant: 'destructive',
        })
      } finally {
        // Задержка для завершения анимации
        setTimeout(() => {
          setProcessingIds((prev) => {
            const newState = { ...prev }
            delete newState[id]
            return newState
          })
        }, 300)
      }
    },
    [onDelete, notifications, t, setIsInitialLoad],
  )

  if (notifications.length === 0 && !isLoading && !error) {
    return <EmptyState t={t} />
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onDelete={handleDelete}
            lang={lang}
            isProcessing={!!processingIds[notification.id]}
          />
        ))}
      </AnimatePresence>

      {/* Индикатор загрузки в конце списка */}
      {isLoading && (
        <div className="py-4 space-y-6">
          <NotificationSkeletonItem />
          {hasMore && (
            <>
              <NotificationSkeletonItem />
              <NotificationSkeletonItem />
            </>
          )}
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <div className="py-4 text-center text-destructive">
          <p>{error}</p>
          <button className="mt-2 text-primary hover:underline" onClick={handleRetry}>
            {t('retry')}
          </button>
        </div>
      )}

      <div ref={endOfListRef} className="h-1" />
    </div>
  )
}

export default memo(InfiniteNotificationsList)
