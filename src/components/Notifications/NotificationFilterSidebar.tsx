'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { NotificationStoredType } from '@/types/notifications'
import { Check, ArrowUp, ArrowDown, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface NotificationFilterSidebarProps {
  filters: { type: string; status: string }
  sort: { sortBy: string; sortOrder: 'asc' | 'desc' }
  onFilterTypeChange: (type: string) => void
  onFilterStatusChange: (status: string) => void
  onSortByChange: (sortBy: string) => void
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void
  onResetFilters: () => void
  onDeleteReadNotifications: () => void
  onClose?: () => void
  className?: string
  isMobile?: boolean
}

const NotificationFilterSidebar: React.FC<NotificationFilterSidebarProps> = ({
  filters,
  sort,
  onFilterTypeChange,
  onFilterStatusChange,
  onSortByChange,
  onSortOrderChange,
  onResetFilters,
  onDeleteReadNotifications,
  onClose,
  className,
  isMobile = false,
}) => {
  const t = useTranslations('Notifications')
  const tControls = useTranslations('Notifications.controls')
  const tTypes = useTranslations('Notifications.type')

  // Состояние для поиска по типам уведомлений
  const [typeSearchQuery, setTypeSearchQuery] = useState('')

  // Группировка типов уведомлений по категориям для более организованного отображения
  const typeGroups = {
    course: [
      NotificationStoredType.COURSE_ENROLLED,
      NotificationStoredType.LESSON_COMPLETED,
      NotificationStoredType.MODULE_COMPLETED,
      NotificationStoredType.COURSE_COMPLETED,
      NotificationStoredType.CERTIFICATE_ISSUED,
      NotificationStoredType.ASSESSMENT_SUBMITTED,
      NotificationStoredType.ASSESSMENT_GRADED,
    ],
    rewards: [NotificationStoredType.ACHIEVEMENT_UNLOCKED, NotificationStoredType.LEVEL_UP],
    system: [
      NotificationStoredType.SYSTEM_ALERT,
      NotificationStoredType.GENERAL_INFO,
      NotificationStoredType.ACCOUNT_ACTIVITY,
    ],
    commerce: [
      NotificationStoredType.ORDER_UPDATE,
      NotificationStoredType.SUBSCRIPTION_UPDATE,
      NotificationStoredType.PROMOTIONAL,
    ],
    social: [NotificationStoredType.SOCIAL_INTERACTION],
  }

  // Все доступные типы уведомлений
  const allNotificationTypes = Object.values(NotificationStoredType).map((type) => ({
    value: type,
    label: tTypes(type as string),
  }))

  // Фильтрация типов на основе поискового запроса
  const filteredNotificationTypes = typeSearchQuery
    ? allNotificationTypes.filter(
        (type) =>
          type.label.toLowerCase().includes(typeSearchQuery.toLowerCase()) ||
          type.value.toLowerCase().includes(typeSearchQuery.toLowerCase()),
      )
    : allNotificationTypes

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

  const hasActiveFilters =
    filters.type !== '' ||
    filters.status !== '' ||
    sort.sortBy !== 'createdAt' ||
    sort.sortOrder !== 'desc'

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-medium">{tControls('filters.title')}</h3>
        <p className="text-sm text-muted-foreground">{tControls('filters.description')}</p>
      </div>

      {/* Кнопка сброса фильтров - перемещаем в верхнюю часть */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          {/* <div className="text-sm text-muted-foreground">{tControls('filters.activeFilters')}</div> */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            onClick={onResetFilters}
          >
            <X className="h-3.5 w-3.5" />
            {tControls('filters.reset')}
          </Button>
        </div>
      )}

      <div className="space-y-5">
        {/* Фильтр по статусу */}
        <div>
          <label className="text-sm font-medium mb-2 block">{tControls('filters.status')}</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Badge
                key={option.value}
                variant={
                  (filters.status === '' && option.value === 'all') ||
                  filters.status === option.value
                    ? 'default'
                    : 'outline'
                }
                className="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
                onClick={() => onFilterStatusChange(option.value === 'all' ? '' : option.value)}
              >
                {((filters.status === '' && option.value === 'all') ||
                  filters.status === option.value) && <Check className="mr-1 h-3 w-3" />}
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Фильтр по типу */}
        <div className="space-y-3">
          <label className="text-sm font-medium block">{tControls('filters.type')}</label>

          {/* Поиск типов */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск типа уведомления..."
              className="pl-8 pr-8"
              value={typeSearchQuery}
              onChange={(e) => setTypeSearchQuery(e.target.value)}
            />
            {typeSearchQuery && (
              <button
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setTypeSearchQuery('')}
                aria-label="Очистить поиск"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Тег "Все типы" */}
          <div className="flex flex-wrap gap-2 pb-1">
            <Badge
              variant={filters.type === '' ? 'default' : 'outline'}
              className="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
              onClick={() => onFilterTypeChange('')}
            >
              {filters.type === '' && <Check className="mr-1 h-3 w-3" />}
              {tControls('filters.allTypes')}
            </Badge>

            {/* Отображаем отфильтрованные типы */}
            {filteredNotificationTypes.map((type) => (
              <Badge
                key={type.value}
                variant={filters.type === type.value ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95',
                  filters.type === type.value ? 'opacity-100' : 'opacity-80 hover:opacity-100',
                )}
                onClick={() => onFilterTypeChange(type.value)}
              >
                {filters.type === type.value && <Check className="mr-1 h-3 w-3" />}
                {type.label}
              </Badge>
            ))}
          </div>

          {typeSearchQuery && filteredNotificationTypes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Типов с таким названием не найдено
            </p>
          )}
        </div>

        {/* Сортировка */}
        <div>
          <label className="text-sm font-medium mb-2 block">{tControls('sortBy.label')}</label>
          <div className="flex flex-col md:flex-row gap-2">
            <Select value={sort.sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className={isMobile ? 'w-full' : 'w-[140px]'}>
                <SelectValue placeholder={tControls('sortBy.field')} />
              </SelectTrigger>
              <SelectContent>
                {sortableFields.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onSortOrderChange(sort.sortOrder === 'asc' ? 'desc' : 'asc')}
              title={
                sort.sortOrder === 'asc'
                  ? tControls('sortBy.descending')
                  : tControls('sortBy.ascending')
              }
              className="h-10 w-10 flex-shrink-0 hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              {sort.sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Кнопка закрытия на мобильных */}
      {isMobile && onClose && (
        <div className="pt-4">
          <Button
            className="w-full transition-all duration-200 hover:brightness-105 active:scale-95"
            onClick={onClose}
          >
            {tControls('filters.apply')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default NotificationFilterSidebar
