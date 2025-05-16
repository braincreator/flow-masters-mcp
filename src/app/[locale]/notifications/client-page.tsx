'use client'

import React, { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import InfiniteNotificationsList from '@/components/Notifications/InfiniteNotificationsList'
import GroupedNotificationsList from '@/components/Notifications/GroupedNotificationsList'
import NotificationPreferences, {
  NotificationPreferences as Preferences,
} from '@/components/Notifications/NotificationPreferences'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotificationActions } from '@/hooks/useNotificationsSelector'
import { toast } from '@/components/ui/use-toast'
import { Loader2, RefreshCw } from 'lucide-react'

export default function NotificationsClientPage() {
  const t = useTranslations('Notifications')
  const locale = useLocale()
  const { markAllAsRead, refetchNotifications } = useNotificationActions()

  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  // Обработчик для маркировки всех уведомлений как прочитанных
  const handleMarkAllAsRead = useCallback(async () => {
    setIsMarkingAllRead(true)
    try {
      await markAllAsRead()
      toast({
        description: t('allMarkedAsRead'),
        duration: 3000,
      })
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast({
        description: t('errors.markAllReadFailed'),
        variant: 'destructive',
      })
    } finally {
      setIsMarkingAllRead(false)
    }
  }, [markAllAsRead, t])

  // Обработчик для обновления уведомлений
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refetchNotifications()
      toast({
        description: t('refreshed'),
        duration: 2000,
      })
    } catch (error) {
      console.error('Error refreshing notifications:', error)
      toast({
        description: t('errors.refreshFailed'),
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [refetchNotifications, t])

  // Мок-функция для сохранения предпочтений (в будущем должна быть реализована)
  const handleSavePreferences = async (preferences: Preferences) => {
    console.log('Saving preferences:', preferences)
    // Здесь должен быть API-запрос к бэкенду для сохранения предпочтений
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Имитация сетевого запроса
    return Promise.resolve()
  }

  // Получаем функции API для списка уведомлений
  const fetchNotifications = useCallback(async (page: number) => {
    // Реальная имплементация должна делать API-запрос
    // Здесь используется заглушка для демонстрации
    console.log(`Fetching notifications page ${page}`)

    // В реальном приложении здесь должен быть API-запрос
    const response = await fetch(`/api/notifications?page=${page}&limit=20`)
    const data = await response.json()

    return {
      items: data.items || [],
      hasMore: data.hasMorePages || false,
      totalCount: data.totalCount || 0,
    }
  }, [])

  const onMarkAsRead = useCallback(async (id: string) => {
    // В реальном приложении здесь должен быть API-запрос
    console.log(`Marking notification ${id} as read`)
    const response = await fetch(`/api/notifications/${id}/mark-read`, {
      method: 'PUT',
    })
    return response.json()
  }, [])

  const onMarkAsUnread = useCallback(async (id: string) => {
    // В реальном приложении здесь должен быть API-запрос
    console.log(`Marking notification ${id} as unread`)
    const response = await fetch(`/api/notifications/${id}/mark-unread`, {
      method: 'PUT',
    })
    return response.json()
  }, [])

  const onDelete = useCallback(async (id: string) => {
    // В реальном приложении здесь должен быть API-запрос
    console.log(`Deleting notification ${id}`)
    const response = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRefreshing ? t('refreshing') : t('refresh')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isMarkingAllRead ? t('markingAllRead') : t('markAllAsRead')}
          </Button>
        </div>

        <div>
          <div className="inline-flex items-center rounded-md bg-muted p-1">
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grouped')}
              className="rounded-sm px-3"
            >
              {t('groupedView')}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-sm px-3"
            >
              {t('listView')}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList className="mb-8">
          <TabsTrigger value="notifications">{t('notificationsTab')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('preferencesTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          {viewMode === 'grouped' ? (
            <GroupedNotificationsList lang={locale} />
          ) : (
            <InfiniteNotificationsList
              fetchNotifications={fetchNotifications}
              onMarkAsRead={onMarkAsRead}
              onMarkAsUnread={onMarkAsUnread}
              onDelete={onDelete}
              filters={{ type: 'all', status: 'all' }}
              sort={{ sortBy: 'createdAt', sortOrder: 'desc' }}
              lang={locale}
            />
          )}
        </TabsContent>

        <TabsContent value="preferences">
          <NotificationPreferences onSave={handleSavePreferences} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
