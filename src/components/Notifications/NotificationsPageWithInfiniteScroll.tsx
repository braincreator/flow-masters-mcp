'use client'

import React, { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { NotificationStoredType } from '@/types/notifications'
import InfiniteNotificationsList, { Notification } from './InfiniteNotificationsList'
import NotificationSkeletonItem from './NotificationSkeletonItem'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Bell,
  Filter,
  MoreHorizontal,
  Check,
  List,
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react'
import NotificationFilterSidebar from './NotificationFilterSidebar'
import { toast } from '@/components/ui/use-toast'

interface NotificationsPageProps {
  lang: string
}

const NotificationsPageWithInfiniteScroll: React.FC<NotificationsPageProps> = ({ lang }) => {
  const t = useTranslations('Notifications')
  const tControls = useTranslations('Notifications.controls')
  const tTypes = useTranslations('Notifications.type')

  // Стейт фильтров и сортировки
  const [filters, setFilters] = useState<{ type: string; status: string }>({ type: '', status: '' })
  const [sort, setSort] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Список типов уведомлений
  const notificationTypes = Object.values(NotificationStoredType).map((type) => ({
    value: type,
    label: tTypes(type as string),
  }))

  // Статусы уведомлений
  const statusOptions = [
    { value: 'all', label: tControls('status.all') },
    { value: 'unread', label: tControls('status.unread') },
    { value: 'read', label: tControls('status.read') },
  ]

  // Варианты сортировки
  const sortableFields = [
    { value: 'createdAt', label: tControls('sortBy.createdAt') },
    { value: 'title', label: tControls('sortBy.title') },
  ]

  // Функция для получения уведомлений с пагинацией
  const fetchNotifications = useCallback(
    async (page: number) => {
      setIsLoading(true)
      try {
        // Построение параметров запроса
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', '10')
        if (filters.type) params.append('type', filters.type)
        if (filters.status) params.append('status', filters.status)
        params.append('sortBy', sort.sortBy)
        params.append('sortOrder', sort.sortOrder)

        // Эмуляция задержки API для демонстрации загрузки
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Фактический запрос к API
        const response = await fetch(`/api/notifications?${params.toString()}`)
        if (!response.ok) {
          throw new Error(t('errors.fetchFailed'))
        }

        const data = await response.json()
        return {
          items: data.items || [],
          hasMore: data.hasMore || false,
          totalCount: data.totalCount,
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [filters, sort, t],
  )

  // Функции для работы с отдельными уведомлениями
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      if (!response.ok) throw new Error(t('errors.markReadFailed'))
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to mark as read:', error)
      return Promise.reject(error)
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/unread`, { method: 'POST' })
      if (!response.ok) throw new Error(t('errors.markUnreadFailed'))
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to mark as unread:', error)
      return Promise.reject(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return Promise.resolve()
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(t('errors.deleteFailed'))
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to delete notification:', error)
      return Promise.reject(error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!confirm(t('confirmMarkAllRead'))) return

    // Мгновенно отображаем действие в UI - даже до запроса подтверждения
    setIsLoading(true)

    try {
      // Оптимистично обновляем UI сразу после подтверждения
      if (filters.status === 'unread') {
        // Если показаны только непрочитанные, применяем анимацию исчезновения
        const animationTimeout = setTimeout(() => {
          setNotifications([]) // Очищаем список с анимацией
        }, 300)
      } else {
        // Иначе обновляем статусы всех уведомлений мгновенно
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, status: 'read' })),
        )
      }

      // Делаем запрос к API после обновления UI
      const response = await fetch('/api/notifications/mark-all-as-read', { method: 'POST' })
      if (!response.ok) throw new Error(t('errors.markAllReadFailed'))

      toast({
        description: t('markAllReadSuccess'),
        variant: 'default',
        duration: 1500,
      })

      // После успешного запроса обновляем данные с сервера для синхронизации
      setIsInitialLoad(true)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast({
        description: t('errors.markAllReadFailed'),
        variant: 'destructive',
        duration: 3000,
      })
      // При ошибке перезагружаем данные для восстановления правильного состояния
      setIsInitialLoad(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAllNotifications = async () => {
    if (!confirm(t('confirmDeleteAll'))) return

    // Мгновенно отображаем действие в UI
    setIsLoading(true)

    try {
      // Применяем анимацию исчезновения к элементам
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isDeleting: true })),
      )

      // Через короткое время очищаем весь список (для анимации)
      setTimeout(() => {
        setNotifications([])
      }, 300)

      // Делаем запрос к API после обновления UI
      const response = await fetch('/api/notifications', { method: 'DELETE' })
      if (!response.ok) throw new Error(t('errors.deleteAllFailed'))

      toast({
        description: t('deleteAllSuccess'),
        variant: 'default',
        duration: 1500,
      })
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
      toast({
        description: t('errors.deleteAllFailed'),
        variant: 'destructive',
        duration: 3000,
      })
      // При ошибке перезагружаем данные
      setIsInitialLoad(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReadNotifications = async () => {
    if (!confirm(t('confirmDeleteRead'))) return

    // Мгновенно отображаем действие в UI
    setIsLoading(true)

    try {
      // Оптимистично обновляем UI
      if (filters.status === 'read') {
        // Если показаны только прочитанные, применяем анимацию исчезновения
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isDeleting: true })),
        )

        // Через короткое время очищаем весь список (для анимации)
        setTimeout(() => {
          setNotifications([])
        }, 300)
      } else {
        // Если показаны все, добавляем анимацию к прочитанным и удаляем их
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.status === 'read' ? { ...notification, isDeleting: true } : notification,
          ),
        )

        // Через короткое время удаляем прочитанные (для анимации)
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((notification) => notification.status === 'unread'),
          )
        }, 300)
      }

      // Делаем запрос к API после обновления UI
      const response = await fetch('/api/notifications/read', { method: 'DELETE' })
      if (!response.ok) throw new Error(t('errors.deleteReadFailed'))

      toast({
        description: t('deleteReadSuccess'),
        variant: 'default',
        duration: 1500,
      })
    } catch (error) {
      console.error('Failed to delete read notifications:', error)
      toast({
        description: t('errors.deleteReadFailed'),
        variant: 'destructive',
        duration: 3000,
      })
      // При ошибке перезагружаем данные
      setIsInitialLoad(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterTypeChange = (type: string) => {
    setFilters((prev) => ({ ...prev, type: type === 'all' ? '' : type }))
  }

  const handleFilterStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status: status === 'all' ? '' : status }))
  }

  const handleSortByChange = (sortBy: string) => {
    setSort((prev) => ({ ...prev, sortBy }))
  }

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    setSort((prev) => ({ ...prev, sortOrder }))
  }

  const toggleSortOrder = () => {
    const newSortOrder = sort.sortOrder === 'asc' ? 'desc' : 'asc'
    handleSortOrderChange(newSortOrder)
  }

  // Действия с уведомлениями
  const ActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <MoreHorizontal className="h-4 w-4 mr-1" />
          {tControls('actions.label')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMarkAllAsRead}>
          <Check className="h-4 w-4 mr-2" />
          {tControls('actions.markAllRead')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDeleteReadNotifications} className="text-amber-600">
          <Trash2 className="h-4 w-4 mr-2" />
          {tControls('actions.deleteRead')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteAllNotifications} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          {tControls('actions.deleteAll')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Основной контент */}
      <div className="flex flex-col md:grid md:grid-cols-[240px_1fr] flex-1 overflow-hidden container mx-auto gap-x-6 pt-4">
        {/* Боковая панель фильтров (десктоп) */}
        <div className="hidden md:block bg-background p-4 space-y-6 pb-20 overflow-y-auto md:sticky md:top-0 md:h-[calc(100vh-4rem)] border-r">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">{t('title')}</h1>
          </div>

          <NotificationFilterSidebar
            filters={filters}
            sort={sort}
            onFilterTypeChange={handleFilterTypeChange}
            onFilterStatusChange={handleFilterStatusChange}
            onSortByChange={handleSortByChange}
            onSortOrderChange={handleSortOrderChange}
            onResetFilters={() => {
              setFilters({ type: '', status: '' })
              setSort({ sortBy: 'createdAt', sortOrder: 'desc' })
              setIsInitialLoad(true) // Перезагружаем данные с новыми фильтрами
            }}
            onDeleteReadNotifications={handleDeleteReadNotifications}
          />
        </div>

        {/* Основной контент */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-4 md:pt-6">
          {/* Мобильный заголовок и кнопки */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">{t('title')}</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Фильтр (мобильный) */}
              <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{tControls('filters.title')}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileFilterOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <NotificationFilterSidebar
                    filters={filters}
                    sort={sort}
                    onFilterTypeChange={handleFilterTypeChange}
                    onFilterStatusChange={handleFilterStatusChange}
                    onSortByChange={handleSortByChange}
                    onSortOrderChange={handleSortOrderChange}
                    onResetFilters={() => {
                      setFilters({ type: '', status: '' })
                      setSort({ sortBy: 'createdAt', sortOrder: 'desc' })
                      setIsInitialLoad(true) // Перезагружаем данные с новыми фильтрами
                    }}
                    onDeleteReadNotifications={handleDeleteReadNotifications}
                    isMobile={true}
                    onClose={() => setIsMobileFilterOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              {/* Действия */}
              <ActionsDropdown />
            </div>
          </div>

          {/* Кнопки действий (десктоп) */}
          <div className="hidden md:flex items-center justify-end mb-6">
            <Button variant="outline" size="sm" className="mr-2" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              {tControls('actions.markAllRead')}
            </Button>
            <ActionsDropdown />
          </div>

          {/* Активные фильтры (мобильные) */}
          {(filters.type || filters.status) && (
            <div className="md:hidden flex flex-wrap gap-2 mb-4">
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {tControls(`status.${filters.status}`)}
                  <button className="ml-1" onClick={() => handleFilterStatusChange('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {tTypes(filters.type as string)}
                  <button className="ml-1" onClick={() => handleFilterTypeChange('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  setFilters({ type: '', status: '' })
                }}
              >
                {tControls('filters.reset')}
              </Button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InfiniteNotificationsList
              fetchNotifications={fetchNotifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
              onDelete={handleDelete}
              filters={filters}
              sort={sort}
              lang={lang}
            />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default NotificationsPageWithInfiniteScroll
