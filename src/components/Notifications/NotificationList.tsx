'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion' // Added for animations
import { Inbox, AlertCircle } from 'lucide-react' // Added for empty state
import NotificationItem from './NotificationItem'
import { type Notification } from './NotificationsPage' // Re-using the type
import { cn } from '@/lib/utils'

// Варианты анимации для списка
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
}

// Варианты анимации для каждого элемента
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } },
}

// Варианты анимации для пустого состояния
const emptyVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAsUnread: (id: string) => Promise<void> // Added this line
  onDelete: (id: string) => Promise<void>
  lang: string
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAsUnread, // Added this line
  onDelete,
  lang,
}) => {
  const t = useTranslations('Notifications.list')

  if (notifications.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center text-center py-16 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-800 backdrop-blur-sm"
        variants={emptyVariants}
        initial="hidden"
        animate="show"
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-2 rounded-full bg-gray-200/50 dark:bg-gray-700/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          <Inbox className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500 relative" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
          {t('emptyState.title')}
        </h3>
        <p className="text-sm max-w-md">{t('emptyState.message')}</p>
      </motion.div>
    )
  }

  return (
    <motion.div className="space-y-4" variants={listVariants} initial="hidden" animate="show">
      <AnimatePresence mode="popLayout" initial={false}>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            layoutId={notification.id}
            variants={itemVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              'origin-top',
              notification.status === 'unread' ? 'z-10' : 'z-0', // Непрочитанные выше в стеке
            )}
          >
            <NotificationItem
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onMarkAsUnread={onMarkAsUnread} // Added this line
              onDelete={onDelete}
              lang={lang}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default NotificationList
