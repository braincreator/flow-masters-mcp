'use client'

import React from 'react'
import NotificationItem from './NotificationItem'
import { type Notification } from './NotificationsPage' // Re-using the type
import AnimateInView from '@/components/AnimateInView'

interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  lang: string
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  lang,
}) => {
  if (notifications.length === 0) {
    return null // Or a "No notifications match your criteria" message if appropriate here
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => (
        <AnimateInView
          key={notification.id}
          direction="up"
          delay={index * 100} // Stagger animation like in ServiceList
        >
          <NotificationItem
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            lang={lang}
          />
        </AnimateInView>
      ))}
    </div>
  )
}

export default NotificationList