'use client'

import React, { useState, memo, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { type Notification } from './NotificationsPage' // Re-using the type, removed NotificationStoredType
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  AlertTriangle,
  MessageSquare,
  CalendarClock,
  Award,
  Bell,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming cn utility is available

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAsUnread: (id: string) => Promise<void> // Added for marking as unread
  onDelete: (id: string) => Promise<void>
  lang: string
}

interface NotificationTypeStyle {
  IconComponent: LucideIcon
  tagClass: string
  iconClass: string
}

const getNotificationTypeStyle = (type: string): NotificationTypeStyle => { // Changed to string to accommodate various types
  switch (type) {
    case 'COURSE_ENROLLED':
      return {
        IconComponent: BookOpen,
        tagClass: 'bg-green-100 text-green-700 border-green-200',
        iconClass: 'text-green-600',
      }
    case 'SYSTEM_ALERT':
      return {
        IconComponent: AlertTriangle,
        tagClass: 'bg-red-100 text-red-700 border-red-200',
        iconClass: 'text-red-600',
      }
    case 'NEW_MESSAGE':
      return {
        IconComponent: MessageSquare,
        tagClass: 'bg-blue-100 text-blue-700 border-blue-200',
        iconClass: 'text-blue-600',
      }
    case 'ASSIGNMENT_DUE':
      return {
        IconComponent: CalendarClock,
        tagClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        iconClass: 'text-yellow-600',
      }
    case 'ACHIEVEMENT_UNLOCKED':
      return {
        IconComponent: Award,
        tagClass: 'bg-purple-100 text-purple-700 border-purple-200',
        iconClass: 'text-purple-600',
      }
    default:
      return {
        IconComponent: Bell,
        tagClass: 'bg-gray-100 text-gray-700 border-gray-200',
        iconClass: 'text-gray-500',
      }
  }
}

const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread, // Added prop
  onDelete,
  lang,
}) => {
  const t = useTranslations('Notifications.item')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [isMarkingUnread, setIsMarkingUnread] = useState(false) // Added state for unread
  const [isDeleting, setIsDeleting] = useState(false)

  const handleMarkAsRead = async () => {
    setIsMarkingRead(true)
    try {
      await onMarkAsRead(notification.id)
    } catch (error) {
      console.error('Failed to mark as read from item:', error)
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(notification.id)
    } catch (error) {
      console.error('Failed to delete from item:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMarkAsUnread = async () => {
    setIsMarkingUnread(true)
    try {
      // Make API call
      const response = await fetch(`/api/notifications/${notification.id}/unread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to mark as unread: ${response.statusText}`)
      }
      // Call parent handler to update UI/state
      await onMarkAsUnread(notification.id)
    } catch (error) {
      console.error('Failed to mark as unread from item:', error)
      // Optionally, show a toast or error message to the user
    } finally {
      setIsMarkingUnread(false)
    }
  }

  const formattedDate = useMemo(() => {
    return new Date(notification.receivedAt).toLocaleString(lang, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }, [notification.receivedAt, lang])

  const typeStyle = useMemo(() => getNotificationTypeStyle(notification.type), [notification.type])

  const cardClassName = cn(
    'w-full rounded-lg border p-4 transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5',
    notification.status === 'unread'
      ? 'bg-blue-50 border-blue-300 border-l-4 border-l-blue-500'
      : 'bg-card border-gray-200 dark:border-gray-700 dark:bg-gray-800',
  )

  return (
    <TooltipProvider delayDuration={300}>
      <Card className={cardClassName}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 pt-1">
            <typeStyle.IconComponent className={cn('w-6 h-6', typeStyle.iconClass)} aria-hidden="true" />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">{notification.title}</h3>
                <Badge variant="outline" className={cn('text-xs mt-1 px-1.5 py-0.5', typeStyle.tagClass)}>
                  {t(`type.${notification.type}`, {}, { defaultValue: notification.type.replace(/_/g, ' ').toLowerCase() })}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2 whitespace-nowrap pt-0.5">
                {formattedDate}
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{notification.shortText}</p>

            {(notification.fullText || notification.link) && (
              <div className="mt-2 space-y-2">
                {notification.fullText && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 mr-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-1" />
                    )}
                    {isExpanded ? t('showLess') : t('showMore')}
                  </Button>
                )}
                {isExpanded && notification.fullText && (
                  <div className="mt-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{notification.fullText}</p>
                  </div>
                )}
                {notification.link && (
                  <a
                    href={notification.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    {t('goToLink')}
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              notification.status === 'unread' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600',
            )}
            aria-label={notification.status === 'unread' ? t('status.unread') : t('status.read')}
          />
          <div className="flex items-center space-x-1">
            {notification.status === 'unread' ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMarkAsRead}
                    disabled={isMarkingRead}
                    aria-label={t('markAsRead')}
                    className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isMarkingRead ? t('markingRead') : t('markAsRead')}</TooltipContent>
              </Tooltip>
            ) : (
               <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMarkAsUnread}
                    disabled={isMarkingUnread}
                    aria-label={t('markAsUnread', { defaultValue: 'Mark as unread' })}
                    className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMarkingUnread ? t('markingUnread', { defaultValue: 'Marking as unread...' }) : t('markAsUnread', { defaultValue: 'Mark as unread' })}
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label={t('delete')}
                  className="w-8 h-8 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isDeleting ? t('deleting') : t('delete')}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  )
}

export default memo(NotificationItemComponent)