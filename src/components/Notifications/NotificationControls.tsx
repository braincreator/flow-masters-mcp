'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button' // Assuming Button component from ShadCN/ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select' // Assuming Select from ShadCN/ui
import { Label } from '@/components/ui/label' // Assuming Label from ShadCN/ui

interface NotificationControlsProps {
  onFilterChange: (filters: { type: string; status: string }) => void
  onSortChange: (sort: { sortBy: string; sortOrder: 'asc' | 'desc' }) => void
  onMarkAllRead: () => void
  onDeleteAll: () => void
  onDeleteRead: () => void
  currentFilters: { type: string; status: string }
  currentSort: { sortBy: string; sortOrder: 'asc' | 'desc' }
  lang: string // For passing to t function if needed, or for specific locale settings
}

const NotificationControls: React.FC<NotificationControlsProps> = ({
  onFilterChange,
  onSortChange,
  onMarkAllRead,
  onDeleteAll,
  onDeleteRead,
  currentFilters,
  currentSort,
  // lang, // lang prop is available if needed
}) => {
  const t = useTranslations('Notifications.controls') // Scoped translations

  const handleTypeChange = (value: string) => {
    onFilterChange({ ...currentFilters, type: value === 'all' ? '' : value })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...currentFilters, status: value === 'all' ? '' : value })
  }

  const handleSortByChange = (value: string) => {
    onSortChange({ ...currentSort, sortBy: value })
  }

  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    onSortChange({ ...currentSort, sortOrder: value })
  }

  // Example types and statuses - these should ideally come from a config or API
  const notificationTypes = ['all', 'info', 'alert', 'promo', 'update']
  const notificationStatuses = ['all', 'unread', 'read']
  const sortableFields = [
    { value: 'receivedAt', label: t('sortBy.receivedAt') },
    { value: 'title', label: t('sortBy.title') }, // Example, if API supports
  ]

  return (
    <div className="p-4 bg-card border rounded-lg shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow">
        <div>
          <Label htmlFor="filter-type" className="text-sm font-medium">
            {t('filterByType')}
          </Label>
          <Select value={currentFilters.type || 'all'} onValueChange={handleTypeChange}>
            <SelectTrigger id="filter-type">
              <SelectValue placeholder={t('selectTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {t(`types.${type}`, { defaultValue: type })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="filter-status" className="text-sm font-medium">
            {t('filterByStatus')}
          </Label>
          <Select value={currentFilters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger id="filter-status">
              <SelectValue placeholder={t('selectStatusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {notificationStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {t(`statuses.${status}`, { defaultValue: status })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sort-by" className="text-sm font-medium">
            {t('sortByLabel')}
          </Label>
          <Select value={currentSort.sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger id="sort-by">
              <SelectValue placeholder={t('selectSortFieldPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {sortableFields.map(field => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sort-order" className="text-sm font-medium">
            {t('sortOrderLabel')}
          </Label>
          <Select value={currentSort.sortOrder} onValueChange={value => handleSortOrderChange(value as 'asc' | 'desc')}>
            <SelectTrigger id="sort-order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t('sortOrder.asc')}</SelectItem>
              <SelectItem value="desc">{t('sortOrder.desc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-4">
        <Button variant="outline" size="sm" onClick={onMarkAllRead} className="w-full sm:w-auto">
          {t('markAllRead')}
        </Button>
        <Button variant="outline" size="sm" onClick={onDeleteRead} className="w-full sm:w-auto">
          {t('deleteRead')}
        </Button>
        <Button variant="destructive" size="sm" onClick={onDeleteAll} className="w-full sm:w-auto">
          {t('deleteAll')}
        </Button>
      </div>
    </div>
  )
}

export default NotificationControls