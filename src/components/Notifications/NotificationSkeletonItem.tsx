import React, { memo } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const SkeletonStyles = {
  base: 'bg-muted rounded',
  icon: 'h-8 w-8',
  badge: 'h-5 w-16',
  title: 'h-5 w-48',
  date: 'h-3 w-20',
  text: 'h-4',
  action: 'h-6 w-6 rounded-full',
}

const NotificationSkeletonItem: React.FC = () => {
  return (
    <Card className="w-full rounded-lg border p-5 mb-4 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 pt-1">
          <div className={cn(SkeletonStyles.base, SkeletonStyles.icon, 'rounded-full')} />
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className={cn(SkeletonStyles.base, SkeletonStyles.title)} />
              <div className={cn(SkeletonStyles.base, SkeletonStyles.badge)} />
            </div>
            <div className={cn(SkeletonStyles.base, SkeletonStyles.date)} />
          </div>

          <div className="mt-3 space-y-2">
            <div className={cn(SkeletonStyles.base, SkeletonStyles.text, 'w-full')} />
            <div className={cn(SkeletonStyles.base, SkeletonStyles.text, 'w-5/6')} />
            <div className={cn(SkeletonStyles.base, SkeletonStyles.text, 'w-2/3')} />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className={cn(SkeletonStyles.base, 'w-2.5 h-2.5 rounded-full')} />
        <div className="flex items-center space-x-2">
          <div className={cn(SkeletonStyles.base, SkeletonStyles.action)} />
          <div className={cn(SkeletonStyles.base, SkeletonStyles.action)} />
        </div>
      </div>
    </Card>
  )
}

// Используем memo для предотвращения излишних ререндеров
export default memo(NotificationSkeletonItem)
