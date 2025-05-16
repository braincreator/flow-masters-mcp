'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useIntersection } from '@/hooks/useIntersection'
import { NotificationStoredType } from '@/types/notifications'
import NotificationItem from './NotificationItem'
import NotificationSkeletonItem from './NotificationSkeletonItem'
import { motion, AnimatePresence } from 'framer-motion'

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

  // Ref для обнаружения конца списка
  const endOfListRef = useRef<HTMLDivElement>(null)

  // Используем IntersectionObserver для определения, когда пользователь достиг конца списка
  const isIntersecting = useIntersection(endOfListRef, {
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
    const loadInitialData = async () => {
      if (isInitialLoad) {
        setIsLoading(true)
        setError(null)
        try {
          const data = await fetchNotifications(1)
          setNotifications(data.items)
          setHasMore(data.hasMore)
        } catch (err) {
          console.error('Failed to load initial notifications:', err)
          setError(err instanceof Error ? err.message : t('errors.unknown'))
        } finally {
          setIsLoading(false)
          setIsInitialLoad(false)
        }
      }
    }

    loadInitialData()
  }, [fetchNotifications, isInitialLoad, t])

  // Загружаем больше данных при достижении конца списка
  useEffect(() => {
    const loadMoreData = async () => {
      if (isIntersecting && !isLoading && hasMore && !isInitialLoad) {
        setIsLoading(true)
        setError(null)
        try {
          const nextPage = currentPage + 1
          const data = await fetchNotifications(nextPage)

          setNotifications((prev) => [...prev, ...data.items])
          setHasMore(data.hasMore)
          setCurrentPage(nextPage)
        } catch (err) {
          console.error('Failed to load more notifications:', err)
          setError(err instanceof Error ? err.message : t('errors.loadMoreFailed'))
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadMoreData()
  }, [isIntersecting, isLoading, hasMore, currentPage, fetchNotifications, isInitialLoad, t])

  if (notifications.length === 0 && !isLoading && !error) {
    return (
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
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <NotificationItem
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onMarkAsUnread={onMarkAsUnread}
              onDelete={onDelete}
              lang={lang}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Индикатор загрузки в конце списка */}
      {isLoading && (
        <div className="py-4">
          <NotificationSkeletonItem />
          {hasMore && <NotificationSkeletonItem />}
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <div className="py-4 text-center text-destructive">
          <p>{error}</p>
          <button
            className="mt-2 text-primary hover:underline"
            onClick={() => {
              setError(null)
              if (currentPage > 1) {
                // Повторить загрузку текущей страницы
                setCurrentPage(currentPage - 1)
                setHasMore(true)
              } else {
                // Перезагрузить с начала
                setIsInitialLoad(true)
              }
            }}
          >
            {t('retry')}
          </button>
        </div>
      )}

      {/* Конец списка */}
      {!hasMore && notifications.length > 0 && (
        <div className="py-6 text-center text-muted-foreground">
          <p>{t('endOfList')}</p>
        </div>
      )}

      {/* Элемент для отслеживания конца списка */}
      <div ref={endOfListRef} className="h-1" />
    </div>
  )
}

export default InfiniteNotificationsList
