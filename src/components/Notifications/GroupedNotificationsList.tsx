'use client'

import React, { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, CheckCheck, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGroupedNotifications, useNotificationActions } from '@/hooks/useNotificationsSelector'
import { NotificationStoredType } from '@/types/notifications'
import NotificationItem from './NotificationItem'
import NotificationSkeletonItem from './NotificationSkeletonItem'
import { toast } from '@/components/ui/use-toast'

interface GroupedNotificationsListProps {
  lang: string
}

interface ExpandedGroups {
  [key: string]: boolean
}

const GroupedNotificationsList: React.FC<GroupedNotificationsListProps> = ({ lang }) => {
  const t = useTranslations('Notifications')
  const tTypes = useTranslations('NotificationTypes')

  const { groups, isLoading, error, hasMoreGroups, loadMoreNotifications, totalUnreadCount } =
    useGroupedNotifications()
  const { markAsRead, markAllAsRead, refetchNotifications } = useNotificationActions()

  // Состояние для хранения информации о развернутых группах
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>({})
  // Состояние для блокировки кнопок во время обработки
  const [processingGroups, setProcessingGroups] = useState<Record<string, boolean>>({})

  // Обработчик для разворачивания/сворачивания группы
  const toggleGroup = useCallback((type: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }, [])

  // Обработчик для маркировки всех уведомлений в группе как прочитанных
  const markGroupAsRead = useCallback(
    async (type: string, items: any[]) => {
      // Блокируем группу
      setProcessingGroups((prev) => ({ ...prev, [type]: true }))

      try {
        // Собираем ID всех непрочитанных уведомлений в группе
        const unreadIds = items
          .filter((notification) => !notification.isRead)
          .map((notification) => notification.id)

        if (unreadIds.length === 0) {
          toast({
            description: t('allAlreadyRead'),
            duration: 2000,
          })
          return
        }

        // Параллельно отмечаем все как прочитанные
        await Promise.all(unreadIds.map((id) => markAsRead(id)))

        toast({
          description: t('groupMarkedAsRead', { count: unreadIds.length }),
          duration: 2000,
        })

        // Обновляем данные
        await refetchNotifications()
      } catch (error) {
        console.error('Error marking group as read:', error)
        toast({
          description: t('errors.markGroupReadFailed'),
          variant: 'destructive',
        })
      } finally {
        // Снимаем блокировку группы
        setProcessingGroups((prev) => {
          const newState = { ...prev }
          delete newState[type]
          return newState
        })
      }
    },
    [markAsRead, refetchNotifications, t],
  )

  if (isLoading && groups.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="w-full overflow-hidden">
            <CardHeader className="pb-2">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2].map((i) => (
                <NotificationSkeletonItem key={i} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">{t('errors.failedToLoad')}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchNotifications()}
            className="mt-2"
          >
            {t('retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (groups.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">{t('noNotifications')}</p>
        </CardContent>
      </Card>
    )
  }

  // Вспомогательная функция для перевода типа уведомления
  const translateType = (type: string): string => {
    return tTypes ? tTypes(type) : type
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const isExpanded = expandedGroups[group.type] || false
        const isProcessing = processingGroups[group.type] || false

        return (
          <motion.div
            key={group.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={cn(
                'w-full overflow-hidden transition-all duration-300',
                isProcessing && 'opacity-80 pointer-events-none',
              )}
            >
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleGroup(group.type)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm flex items-center gap-1.5">
                      {translateType(group.type)}

                      {/* Индикатор количества уведомлений */}
                      <Badge variant="secondary" className="ml-1">
                        {group.count}
                      </Badge>

                      {/* Индикатор непрочитанных уведомлений */}
                      {group.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-1 bg-blue-500 hover:bg-blue-600 animate-pulse"
                        >
                          {group.unreadCount}
                        </Badge>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Кнопка "Отметить все как прочитанные" в группе */}
                    {group.unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation() // Предотвращаем переключение группы
                          markGroupAsRead(group.type, group.items)
                        }}
                        disabled={isProcessing}
                      >
                        <CheckCheck className="h-3.5 w-3.5 mr-1" />
                        {t('markAllRead')}
                      </Button>
                    )}

                    {/* Индикатор сворачивания/разворачивания */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0 space-y-3">
                      {group.items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onMarkAsUnread={async (id) => {
                            /* Реализация для маркировки как непрочитанное */
                          }}
                          onDelete={async (id) => {
                            /* Реализация для удаления */
                          }}
                          lang={lang}
                        />
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isExpanded && group.count > 3 && (
                <CardFooter className="pt-0 pb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => toggleGroup(group.type)}
                  >
                    {t('showMoreCount', { count: group.count })}
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        )
      })}

      {hasMoreGroups && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => loadMoreNotifications()}
          disabled={isLoading}
        >
          {isLoading ? t('loading') : t('loadMore')}
        </Button>
      )}
    </div>
  )
}

export default GroupedNotificationsList
