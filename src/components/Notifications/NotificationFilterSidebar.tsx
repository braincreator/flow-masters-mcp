'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
// Segmented control might need a custom component or a library like Radix UI's ToggleGroup
// For now, let's assume a similar structure to RadioGroup or plan to use one.
// import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface NotificationFilterSidebarProps {
  onFilterChange: (filters: { type: string; status: string }) => void
  currentFilters: { type: string; status: string }
  // lang: string // lang prop is available if needed
}

// Example types and statuses - these should ideally come from a config or API, or be passed as props
const NOTIFICATION_TYPES = ['all', 'info', 'alert', 'promo', 'update']
const NOTIFICATION_STATUSES = ['all', 'unread', 'read']

const NotificationFilterSidebar: React.FC<NotificationFilterSidebarProps> = ({
  onFilterChange,
  currentFilters,
}) => {
  const t = useTranslations('Notifications.filters') // Scoped translations

  const handleTypeChange = (value: string) => {
    onFilterChange({ ...currentFilters, type: value === 'all' ? '' : value })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...currentFilters, status: value === 'all' ? '' : value })
  }

  const clearAllFilters = () => {
    onFilterChange({ type: '', status: '' })
  }

  return (
    // TODO: Add collapsible/off-canvas drawer logic here
    // For now, a simple div wrapper
    <aside className="w-full md:w-64 lg:w-72 p-4 border-r bg-card space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('filterByType')}</h3>
        <RadioGroup
          value={currentFilters.type || 'all'}
          onValueChange={handleTypeChange}
          className="space-y-2"
        >
          {NOTIFICATION_TYPES.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <RadioGroupItem value={type} id={`type-${type}`} />
              <Label htmlFor={`type-${type}`} className="font-normal">
                {t(`types.${type}` as any, {}, { defaultValue: type.charAt(0).toUpperCase() + type.slice(1) })}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t('filterByStatus')}</h3>
        {/* Using RadioGroup for status as well, can be swapped for SegmentedControl/ToggleGroup */}
        <RadioGroup
          value={currentFilters.status || 'all'}
          onValueChange={handleStatusChange}
          className="space-y-2"
        >
          {NOTIFICATION_STATUSES.map(status => (
            <div key={status} className="flex items-center space-x-2">
              <RadioGroupItem value={status} id={`status-${status}`} />
              <Label htmlFor={`status-${status}`} className="font-normal">
                {t(`statuses.${status}` as any, {}, { defaultValue: status.charAt(0).toUpperCase() + status.slice(1) })}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Button variant="outline" className="w-full" onClick={clearAllFilters}>
          {t('clearAllFilters')}
        </Button>
      </div>
    </aside>
  )
}

export default NotificationFilterSidebar