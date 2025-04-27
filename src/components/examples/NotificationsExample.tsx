'use client'

import React, { useState } from 'react'
import { 
  useNotifications, 
  useToastNotifications, 
  useNotificationsList,
  useNotificationActions
} from '@/hooks/useContexts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Check, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  MessageSquare, 
  Trophy, 
  Settings 
} from 'lucide-react'
import { NotificationType } from '@/providers/NotificationsProvider'

export function NotificationsExample() {
  // Example using the full context
  const { unreadCount } = useNotifications()
  
  // Example using selector hooks for better performance
  const { showToast, dismissToast } = useToastNotifications()
  const { notifications } = useNotificationsList()
  const { addNotification, markAsRead, markAllAsRead } = useNotificationActions()
  
  // Form state for creating notifications
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotificationType>('info')
  
  // Handle showing a toast notification
  const handleShowToast = () => {
    if (!title) return
    
    showToast(type, title, message, {
      duration: 5000,
      action: {
        label: 'Dismiss',
        onClick: () => console.log('Toast dismissed')
      }
    })
  }
  
  // Handle adding a persistent notification
  const handleAddNotification = async () => {
    if (!title) return
    
    try {
      await addNotification({
        title,
        message,
        type,
        priority: 'normal',
      })
      
      // Clear form
      setTitle('')
      setMessage('')
    } catch (error) {
      console.error('Failed to add notification:', error)
    }
  }
  
  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'message': return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'achievement': return <Trophy className="h-4 w-4 text-purple-500" />
      case 'system': return <Settings className="h-4 w-4 text-gray-500" />
      case 'info':
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Notifications Example</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            {unreadCount}
          </Badge>
        </div>
        <CardDescription>
          This component demonstrates how to use the NotificationsProvider
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="create">Create Notification</TabsTrigger>
            <TabsTrigger value="list">Notification List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Notification Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['info', 'success', 'warning', 'error', 'message', 'achievement', 'system'] as NotificationType[]).map((t) => (
                    <Button
                      key={t}
                      variant={type === t ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setType(t)}
                      className="flex items-center gap-1"
                    >
                      {getNotificationIcon(t)}
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message (optional)</label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleShowToast} disabled={!title}>
                  Show Toast
                </Button>
                <Button onClick={handleAddNotification} disabled={!title} variant="outline">
                  Add Persistent Notification
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Notifications ({notifications.length})</h3>
              <Button size="sm" variant="outline" onClick={() => markAllAsRead()}>
                Mark All as Read
              </Button>
            </div>
            
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-md ${
                      notification.isRead ? 'bg-background' : 'bg-muted'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <span className="font-medium">{notification.title}</span>
                      </div>
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                    {notification.message && (
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Using selector hooks for better performance: useToastNotifications, useNotificationsList, 
          useNotificationActions
        </p>
      </CardFooter>
    </Card>
  )
}
