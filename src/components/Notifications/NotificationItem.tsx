'use client'

import React, { useState, memo, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { type Notification } from './InfiniteNotificationsList'
import { NotificationStoredType } from '@/types/notifications' // Added import
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  BookOpen, // Keep for COURSE_ENROLLED
  AlertTriangle, // Keep for SYSTEM_ALERT
  MessageSquare, // Keep for SOCIAL_INTERACTION (was NEW_MESSAGE)
  CalendarClock, // Can be used for specific reminders if any, or removed if not mapped
  Award, // Keep for ACHIEVEMENT_UNLOCKED, MODULE_COMPLETED
  Bell, // Default
  Info, // For GENERAL_INFO
  ShoppingCart, // For ORDER_UPDATE
  RefreshCw, // For SUBSCRIPTION_UPDATE
  UserCog, // For ACCOUNT_ACTIVITY
  Megaphone, // For PROMOTIONAL
  CheckCircle, // For LESSON_COMPLETED
  Layers, // Alt for MODULE_COMPLETED or new type
  FileText, // For ASSESSMENT_SUBMITTED
  ClipboardCheck, // For ASSESSMENT_GRADED
  GraduationCap, // For COURSE_COMPLETED
  FileArchive as FileAward, // Lucide doesn't have FileAward, using FileArchive as placeholder
  TrendingUp, // For LEVEL_UP
  Percent, // Alt for PROMOTIONAL
  Clock, // Для отображения времени
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAsUnread: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  lang: string
  isProcessing?: boolean
  variant?: 'default' | 'compact' // Добавляем вариант отображения
}

interface NotificationTypeStyle {
  IconComponent: LucideIcon
  tagClass: string
  iconClass: string
}

const getNotificationTypeStyle = (type: NotificationStoredType): NotificationTypeStyle => {
  switch (type) {
    // Course Related
    case NotificationStoredType.COURSE_ENROLLED:
      return {
        IconComponent: BookOpen,
        tagClass:
          'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
        iconClass: 'text-green-600 dark:text-green-400',
      }
    case NotificationStoredType.LESSON_COMPLETED:
      return {
        IconComponent: CheckCircle,
        tagClass:
          'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
        iconClass: 'text-green-600 dark:text-green-400',
      }
    case NotificationStoredType.MODULE_COMPLETED: // Using Award, could be Layers
      return {
        IconComponent: Award,
        tagClass:
          'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900 dark:text-sky-300 dark:border-sky-700',
        iconClass: 'text-sky-600 dark:text-sky-400',
      }
    case NotificationStoredType.ASSESSMENT_SUBMITTED:
      return {
        IconComponent: FileText,
        tagClass:
          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
        iconClass: 'text-blue-600 dark:text-blue-400',
      }
    case NotificationStoredType.ASSESSMENT_GRADED:
      return {
        IconComponent: ClipboardCheck,
        tagClass:
          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
        iconClass: 'text-blue-600 dark:text-blue-400',
      }
    case NotificationStoredType.COURSE_COMPLETED:
      return {
        IconComponent: GraduationCap,
        tagClass:
          'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700',
        iconClass: 'text-emerald-600 dark:text-emerald-400',
      }
    case NotificationStoredType.CERTIFICATE_ISSUED:
      return {
        IconComponent: FileAward, // Using placeholder FileArchive
        tagClass:
          'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700',
        iconClass: 'text-purple-600 dark:text-purple-400',
      }
    // Gamification
    case NotificationStoredType.ACHIEVEMENT_UNLOCKED:
      return {
        IconComponent: Award,
        tagClass:
          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700',
        iconClass: 'text-amber-600 dark:text-amber-400',
      }
    case NotificationStoredType.LEVEL_UP:
      return {
        IconComponent: TrendingUp,
        tagClass:
          'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
        iconClass: 'text-yellow-600 dark:text-yellow-400',
      }
    // System & General
    case NotificationStoredType.SYSTEM_ALERT:
      return {
        IconComponent: AlertTriangle,
        tagClass:
          'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
        iconClass: 'text-red-600 dark:text-red-400',
      }
    case NotificationStoredType.GENERAL_INFO:
      return {
        IconComponent: Info,
        tagClass:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500',
        iconClass: 'text-slate-500 dark:text-slate-400',
      }
    // Specific Categories
    case NotificationStoredType.ORDER_UPDATE:
      return {
        IconComponent: ShoppingCart,
        tagClass:
          'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700',
        iconClass: 'text-orange-600 dark:text-orange-400',
      }
    case NotificationStoredType.SUBSCRIPTION_UPDATE:
      return {
        IconComponent: RefreshCw,
        tagClass:
          'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-300 dark:border-cyan-700',
        iconClass: 'text-cyan-600 dark:text-cyan-400',
      }
    case NotificationStoredType.ACCOUNT_ACTIVITY:
      return {
        IconComponent: UserCog,
        tagClass:
          'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900 dark:text-teal-300 dark:border-teal-700',
        iconClass: 'text-teal-600 dark:text-teal-400',
      }
    case NotificationStoredType.PROMOTIONAL:
      return {
        IconComponent: Megaphone, // Or Percent
        tagClass:
          'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700',
        iconClass: 'text-indigo-600 dark:text-indigo-400',
      }
    case NotificationStoredType.SOCIAL_INTERACTION:
      return {
        IconComponent: MessageSquare,
        tagClass:
          'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900 dark:text-pink-300 dark:border-pink-700',
        iconClass: 'text-pink-600 dark:text-pink-400',
      }
    default:
      // Fallback for any unmapped types, though all should be covered

      const exhaustiveCheck: never = type
      console.warn(`Unhandled notification type in getNotificationTypeStyle: ${exhaustiveCheck}`)
      return {
        IconComponent: Bell,
        tagClass:
          'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500',
        iconClass: 'text-gray-500 dark:text-gray-400',
      }
  }
}

const formatNotificationMessage = (
  messageKey: string,
  t: any, // Translation function для Notifications.item
  tBodies: any, // Translation function для NotificationBodies
  messageParams?: Record<string, any>,
): string => {
  try {
    // Проверяем, содержит ли ключ уже префикс NotificationBodies или суффикс _detail
    let bodyKey = messageKey

    // Удаляем префикс NotificationBodies. если он есть
    if (bodyKey.startsWith('NotificationBodies.')) {
      bodyKey = bodyKey.replace('NotificationBodies.', '')
    }

    // Если ключ не заканчивается на _detail, добавляем суффикс
    if (!bodyKey.endsWith('_detail')) {
      bodyKey = `${bodyKey}_detail`
    }

    // Проверяем, доступен ли перевод с таким ключом в NotificationBodies
    if (tBodies && typeof tBodies === 'function') {
      try {
        if (messageParams && typeof messageParams === 'object') {
          return tBodies(bodyKey, messageParams)
        }
        return tBodies(bodyKey)
      } catch (bodyError) {
        // Если не нашли ключ в NotificationBodies, используем обычный ключ
        console.warn(
          `Key ${bodyKey} not found in NotificationBodies, falling back to regular translation`,
        )
      }
    }

    // Если не удалось найти в NotificationBodies, используем обычный перевод
    if (messageParams && typeof messageParams === 'object') {
      return t(messageKey, messageParams)
    }

    // Иначе просто возвращаем переведенный текст
    return t(messageKey)
  } catch (error) {
    console.error(`Error formatting message with key "${messageKey}":`, error)
    return messageKey // Возвращаем сам ключ в случае ошибки
  }
}

const formatDate = (dateString: string, lang: string, timeOnly = false): string => {
  try {
    if (!dateString) return ''

    const date = new Date(dateString)

    // Проверка на валидность даты
    if (isNaN(date.getTime())) {
      console.error(`Invalid date: ${dateString}`)
      return ''
    }

    // Если нужно только время
    if (timeOnly) {
      return date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
    }

    // Всегда возвращаем полную дату с временем
    return (
      date.toLocaleDateString(lang, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) + `, ${date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}`
    )
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString || ''
  }
}

const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  lang,
  isProcessing = false,
  variant = 'default', // По умолчанию полный размер
}) => {
  const t = useTranslations('Notifications.item')
  const tTypes = useTranslations('Notifications.type')
  const tBodies = useTranslations('NotificationBodies')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [isMarkingUnread, setIsMarkingUnread] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [localStatus, setLocalStatus] = useState(notification.status)

  // Используем эффект для обновления локального статуса при изменении входящего статуса
  useEffect(() => {
    setLocalStatus(notification.status)
  }, [notification.status])

  const handleMarkAsRead = async () => {
    if (isMarkingRead || isDeleting || isProcessing) return

    // Мгновенно обновляем локальное состояние для отзывчивого UI
    setIsMarkingRead(true)
    setLocalStatus('read')

    try {
      await onMarkAsRead(notification.id)
    } catch (error) {
      console.error('Failed to mark as read from item:', error)
      // Возвращаем предыдущее состояние при ошибке
      setLocalStatus('unread')
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting || isMarkingRead || isMarkingUnread || isProcessing) return

    // Мгновенно обновляем локальное состояние
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
    if (isMarkingUnread || isDeleting || isProcessing) return

    // Мгновенно обновляем локальное состояние
    setIsMarkingUnread(true)
    setLocalStatus('unread')

    try {
      await onMarkAsUnread(notification.id)
    } catch (error) {
      console.error('Failed to mark as unread from item:', error)
      // Возвращаем предыдущее состояние при ошибке
      setLocalStatus('read')
    } finally {
      setIsMarkingUnread(false)
    }
  }

  const formattedDate = useMemo(() => {
    return formatDate(notification.createdAt, lang)
  }, [notification.createdAt, lang])

  const typeStyle = useMemo(() => getNotificationTypeStyle(notification.type), [notification.type])

  const isCompact = variant === 'compact'

  const cardClassName = cn(
    'w-full rounded-lg border backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
    localStatus === 'unread'
      ? 'bg-blue-50/90 border-blue-300 border-l-4 border-l-blue-500 dark:bg-blue-950/20 dark:border-blue-800 dark:border-l-blue-600 shadow-md'
      : 'bg-card/90 border-gray-200 dark:border-gray-700 dark:bg-gray-800/90 shadow-sm',
    (isProcessing || isMarkingRead || isMarkingUnread || isDeleting) &&
      'opacity-80 pointer-events-none',
    isCompact ? 'p-3' : 'p-5', // Меньший padding для компактного режима
  )

  // Состояние активности (для микроанимаций)
  const isActive = isProcessing || isMarkingRead || isMarkingUnread || isDeleting

  // Для компактного режима возвращаем упрощенную версию карточки
  if (isCompact) {
    return (
      <TooltipProvider delayDuration={200}>
        <motion.div
          whileHover={{ scale: isActive ? 1 : 1.01 }}
          whileTap={{ scale: isActive ? 1 : 0.99 }}
          initial={{ opacity: 0, y: 5 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: isActive ? 0.98 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
            opacity: { duration: 0.2 },
            scale: { duration: 0.1 },
          }}
        >
          <Card className={cardClassName}>
            {isActive && (
              <div className="absolute inset-0 bg-background/30 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 relative">
                <typeStyle.IconComponent
                  className={cn('w-4 h-4 mt-0.5', typeStyle.iconClass)}
                  aria-hidden="true"
                />
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-1.5">
                  <h3
                    className={cn(
                      'text-sm line-clamp-1',
                      localStatus === 'unread' ? 'font-bold' : 'font-medium',
                    )}
                  >
                    {notification.title}
                  </h3>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1">
                  {notification.messageKey
                    ? formatNotificationMessage(
                        notification.messageKey,
                        t,
                        tBodies,
                        notification.messageParams,
                      )
                    : notification.shortText || notification.title}
                </p>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        localStatus === 'unread'
                          ? 'bg-blue-500 dark:bg-blue-400'
                          : 'bg-gray-300 dark:bg-gray-600',
                      )}
                    />
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] px-1 py-0', typeStyle.tagClass)}
                    >
                      {tTypes ? tTypes(notification.type as string) : notification.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {localStatus === 'unread' ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleMarkAsRead}
                            disabled={isMarkingRead || isProcessing}
                            aria-label={t('markAsRead')}
                            className="w-6 h-6"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="z-[9999]">
                          {t('markAsRead')}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleMarkAsUnread}
                            disabled={isMarkingUnread || isProcessing}
                            aria-label={t('markAsUnread')}
                            className="w-6 h-6"
                          >
                            <EyeOff className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="z-[9999]">
                          {t('markAsUnread')}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-1 text-gray-400">
                  <Clock className="h-2.5 w-2.5" />
                  <span className="text-[10px] whitespace-nowrap">
                    {formatDate(notification.createdAt, lang, false)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </TooltipProvider>
    )
  }

  // Для полного режима возвращаем оригинальную карточку
  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        whileHover={{ scale: isActive ? 1 : 1.01 }}
        whileTap={{ scale: isActive ? 1 : 0.99 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isActive ? 0.98 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
          opacity: { duration: 0.2 },
          scale: { duration: 0.1 },
        }}
      >
        <Card className={cardClassName}>
          {isActive && (
            <div className="absolute inset-0 bg-background/30 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 pt-1 relative">
              <div
                className={cn('absolute -inset-1 rounded-full opacity-20', typeStyle.iconClass)}
              ></div>
              <typeStyle.IconComponent
                className={cn('w-6 h-6 relative', typeStyle.iconClass)}
                aria-hidden="true"
              />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className={cn(
                      'text-md text-gray-800 dark:text-gray-100',
                      localStatus === 'unread' ? 'font-bold' : 'font-semibold',
                    )}
                  >
                    {notification.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={cn('text-xs px-1.5 py-0.5', typeStyle.tagClass)}
                    >
                      {tTypes ? tTypes(notification.type as string) : notification.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <p
                className={cn(
                  'text-sm text-gray-600 dark:text-gray-300 mt-2',
                  localStatus === 'unread' ? 'font-medium' : '',
                )}
              >
                {notification.messageKey
                  ? formatNotificationMessage(
                      notification.messageKey,
                      t,
                      tBodies,
                      notification.messageParams,
                    )
                  : notification.shortText || notification.title}
              </p>

              {(notification.fullText || notification.link) && (
                <div className="mt-2 space-y-2">
                  {notification.fullText && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      aria-expanded={isExpanded}
                      className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200"
                    >
                      <motion.div
                        className="flex items-center"
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 mr-1" />
                        {isExpanded ? t('showLess') : t('showMore')}
                      </motion.div>
                    </Button>
                  )}
                  <AnimatePresence>
                    {isExpanded && notification.fullText && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 pt-2 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                          {notification.fullText}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {notification.link && (
                    <a
                      href={notification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
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
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-colors duration-200',
                  localStatus === 'unread'
                    ? 'bg-blue-500 dark:bg-blue-400'
                    : 'bg-gray-300 dark:bg-gray-600',
                )}
                aria-label={localStatus === 'unread' ? t('status.unread') : t('status.read')}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {localStatus === 'unread' ? t('status.unread') : t('status.read')}
              </span>
              <div className="flex items-center ml-2 text-gray-400">
                <span className="inline-block w-[1px] h-3 bg-gray-300 dark:bg-gray-600 mx-1"></span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs whitespace-nowrap">
                    {formatDate(notification.createdAt, lang, false)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {localStatus === 'unread' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMarkAsRead}
                      disabled={isMarkingRead || isProcessing}
                      aria-label={t('markAsRead')}
                      className={cn(
                        'group w-8 h-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 active:scale-95 transform transition-all duration-200',
                        isMarkingRead && 'bg-blue-50 dark:bg-blue-900/10',
                      )}
                    >
                      <Eye className={cn('w-4 h-4', isMarkingRead && 'animate-pulse')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="z-[9999]">
                    {isMarkingRead ? t('markingRead') : t('markAsRead')}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMarkAsUnread}
                      disabled={isMarkingUnread || isProcessing}
                      aria-label={t('markAsUnread')}
                      className={cn(
                        'group w-8 h-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 active:scale-95 transform transition-all duration-200',
                        isMarkingUnread && 'bg-blue-50 dark:bg-blue-900/10',
                      )}
                    >
                      <EyeOff className={cn('w-4 h-4', isMarkingUnread && 'animate-pulse')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="z-[9999]">
                    {isMarkingUnread ? t('markingUnread') : t('markAsUnread')}
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isDeleting || isProcessing}
                    aria-label={t('delete')}
                    className={cn(
                      'group w-8 h-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-95 transform transition-all duration-200',
                      isDeleting && 'bg-red-50 dark:bg-red-900/10',
                    )}
                  >
                    <Trash2 className={cn('w-4 h-4', isDeleting && 'animate-pulse')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {isDeleting ? t('deleting') : t('delete')}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

export default memo(NotificationItemComponent)
