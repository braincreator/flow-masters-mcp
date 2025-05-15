'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
// import { useRouter, useSearchParams } from 'next/navigation' // TODO: Uncomment when implementing query param handling
import NotificationList from './NotificationList'
import NotificationFilterSidebar from './NotificationFilterSidebar' // New Sidebar
import NotificationTopBar from './NotificationTopBar' // New Top Bar
import { Pagination } from '@/components/Pagination'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button' // For sidebar toggle
import { Menu, X } from 'lucide-react' // Icons for sidebar toggle

// Define Notification type based on API spec
export interface Notification {
  id: string
  title: string
  shortText: string
  fullText?: string
  receivedAt: string // ISO date string
  type: 'info' | 'alert' | 'promo' | 'update' // Example types
  status: 'read' | 'unread'
  icon?: string
  link?: string
}

interface NotificationsPageContentProps {
  lang: string
}

const NotificationsPageContent: React.FC<NotificationsPageContentProps> = ({ lang }) => {
  const t = useTranslations('Notifications')
  // const router = useRouter() // TODO: Uncomment for query param updates
  // const searchParams = useSearchParams() // TODO: Uncomment for reading query params

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<{ type: string; status: string }>({ type: '', status: '' })
  const [sort, setSort] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({ sortBy: 'receivedAt', sortOrder: 'desc' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // For mobile sidebar

  const API_BASE_URL = '/api/notifications' // TODO: Adjust if your API path is different

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '10') // Or make this configurable
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      params.append('sortBy', sort.sortBy)
      params.append('sortOrder', sort.sortOrder)

      const queryString = params.toString()
      console.log('[NotificationsPage] Fetching notifications with params:', queryString) // Added log

      // TODO: Update router with new searchParams if needed
      // const newPath = `/notifications?${queryString}`
      // router.push(newPath, { scroll: false })

      const response = await fetch(`${API_BASE_URL}?${queryString}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) // Attempt to parse error, default to empty object
        console.error('[NotificationsPage] API Error Response:', response.status, errorData) // Added log
        throw new Error(errorData.message || `Failed to fetch notifications: ${response.statusText}`)
      }
      const data = await response.json()
      console.log('[NotificationsPage] API Success Response Data:', data) // Added log
      setNotifications(data.items || [])
      setTotalPages(data.totalPages || 1)
      // setCurrentPage(data.currentPage || 1) // Also ensure currentPage from API is used if available
    } catch (err) {
      console.error('[NotificationsPage] Fetch Error:', err) // Added log
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filters, sort, lang])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFilterChange = (newFilters: { type: string; status: string }) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSortChange = (newSort: { sortBy: string; sortOrder: 'asc' | 'desc' }) => {
    setSort(newSort)
    setCurrentPage(1)
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/read`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to mark as read')
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n))
    } catch (err) {
      console.error("Failed to mark as read:", err)
      // TODO: Show toast notification
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mark-all-as-read`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to mark all as read')
      fetchNotifications()
    } catch (err) {
      console.error("Failed to mark all as read:", err)
      // TODO: Show toast notification
    }
  }

  const deleteNotification = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete notification')
      fetchNotifications()
    } catch (err) {
      console.error("Failed to delete notification:", err)
      // TODO: Show toast notification
    }
  }

  const deleteAllNotifications = async () => {
    if (!confirm(t('confirmDeleteAll'))) return;
    try {
      const response = await fetch(`${API_BASE_URL}/all`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete all notifications')
      fetchNotifications()
    } catch (err) {
      console.error("Failed to delete all notifications:", err)
      // TODO: Show toast notification
    }
  }

  const deleteReadNotifications = async () => {
    if (!confirm(t('confirmDeleteRead'))) return;
    try {
      const response = await fetch(`${API_BASE_URL}/read`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete read notifications')
      fetchNotifications()
    } catch (err) {
      console.error("Failed to delete read notifications:", err)
      // TODO: Show toast notification
    }
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>{t('errorTitle')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Page Header */}
      <header className="p-4 border-b bg-card sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
          <Button variant="outline" size="icon" className="md:hidden" onClick={toggleSidebar}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">{isSidebarOpen ? t('closeFilters') : t('openFilters')}</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden container mx-auto">
        {/* Collapsible Left Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out
            md:sticky md:top-[calc(theme(spacing.16)+1px)] md:h-[calc(100vh-theme(spacing.16)-1px)] md:!transform-none md:w-72 md:border-r md:z-10
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ top: isSidebarOpen ? 0 : undefined }} // Full height when open on mobile
        >
          <div className="h-full overflow-y-auto">
            <NotificationFilterSidebar
              onFilterChange={handleFilterChange}
              currentFilters={filters}
            />
          </div>
        </div>
        
        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Top Bar for sorting and bulk actions */}
          <div className="sticky top-[calc(theme(spacing.16)+1px)] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <NotificationTopBar
              onSortChange={handleSortChange}
              currentSort={sort}
              onMarkAllRead={markAllAsRead}
              onDeleteAll={deleteAllNotifications}
              onDeleteRead={deleteReadNotifications}
            />
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            {isLoading && notifications.length > 0 && <div className="text-center py-4">{t('loadingMore')}...</div>}
            {!isLoading && notifications.length === 0 && !error && (
              <div className="text-center py-10">
                <p className="text-lg text-muted-foreground">{t('noNotifications')}</p>
              </div>
            )}
            {notifications.length > 0 && (
              <NotificationList
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                lang={lang}
              />
            )}
            {totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default NotificationsPageContent