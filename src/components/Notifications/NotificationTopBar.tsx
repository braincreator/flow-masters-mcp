'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
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
} from '@/components/ui/dropdown-menu' // Assuming DropdownMenu from ShadCN/ui
import { Label } from '@/components/ui/label'
import { MoreHorizontal } from 'lucide-react' // Icon for "More Actions"

interface NotificationTopBarProps {
  onSortChange: (sort: { sortBy: string; sortOrder: 'asc' | 'desc' }) => void
  currentSort: { sortBy: string; sortOrder: 'asc' | 'desc' }
  onMarkAllRead: () => void
  onDeleteAll: () => void
  onDeleteRead: () => void
  // lang: string // lang prop is available if needed
}

const NotificationTopBar: React.FC<NotificationTopBarProps> = ({
  onSortChange,
  currentSort,
  onMarkAllRead,
  onDeleteAll,
  onDeleteRead,
}) => {
  const t = useTranslations('Notifications.topbar') // Scoped translations
  const tControls = useTranslations('Notifications.controls') // For reusing some translations

  const handleSortByChange = (value: string) => {
    onSortChange({ ...currentSort, sortBy: value })
  }

  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    onSortChange({ ...currentSort, sortOrder: value })
  }

  // Example sortable fields - these should ideally come from a config or API
  const sortableFields = [
    { value: 'receivedAt', label: tControls('sortBy.receivedAt') },
    { value: 'title', label: tControls('sortBy.title') },
  ]

  return (
    <div className="p-4 bg-card border-b rounded-t-lg flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div>
          <Label htmlFor="sort-by-topbar" className="text-sm font-medium sr-only">
            {tControls('sortByLabel')}
          </Label>
          <Select value={currentSort.sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger id="sort-by-topbar" className="min-w-[180px]">
              <SelectValue placeholder={tControls('selectSortFieldPlaceholder')} />
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
          <Label htmlFor="sort-order-topbar" className="text-sm font-medium sr-only">
            {tControls('sortOrderLabel')}
          </Label>
          <Select
            value={currentSort.sortOrder}
            onValueChange={value => handleSortOrderChange(value as 'asc' | 'desc')}
          >
            <SelectTrigger id="sort-order-topbar" className="min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{tControls('sortOrder.asc')}</SelectItem>
              <SelectItem value="desc">{tControls('sortOrder.desc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onMarkAllRead}>
          {tControls('markAllRead')}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t('moreActions')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDeleteRead}>
              {tControls('deleteRead')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeleteAll} className="text-destructive hover:!text-destructive-foreground hover:!bg-destructive">
              {tControls('deleteAll')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default NotificationTopBar