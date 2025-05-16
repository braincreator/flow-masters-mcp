'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion' // Added for animations
import { NotificationStoredType } from '@/types/notifications' // Added import
// import { useRouter, useSearchParams } from 'next/navigation' // TODO: Uncomment when implementing query param handling
import NotificationList from './NotificationList'
import NotificationFilterSidebar from './NotificationFilterSidebar' // New Sidebar
import NotificationSkeletonItem from './NotificationSkeletonItem' // Added Skeleton Item
// NotificationTopBar will be removed and its functionality merged into the header
import { Pagination } from '@/components/ui/pagination'
// import { LoadingSpinner } from '../../components/ui/LoadingSpinner' // Replaced by skeleton
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Menu, X, Settings, MoreHorizontal, Filter, Inbox } from 'lucide-react' // Added Settings, MoreHorizontal, Filter, Inbox
import { SkeletonStyles } from './NotificationSkeletonItem' // Импорт стилей для скелетона

// Define Notification type based on API spec
export interface Notification {
  id: string
  title: string
  shortText: string
  fullText?: string
  receivedAt: string // ISO date string
  type: NotificationStoredType // Updated to use actual stored types
  status: 'read' | 'unread'
  icon?: string
  link?: string
}

interface NotificationsPageContentProps {
  lang: string
}

const NotificationsPageContent: React.FC<NotificationsPageContentProps> = ({ lang }) => {
  const t = useTranslations('Notifications')
  const tControls = useTranslations('Notifications.controls') // For controls like markAllRead, deleteRead etc.
  const tTopBar = useTranslations('Notifications.topbar') // For "More Actions" etc.
  // const router = useRouter() // TODO: Uncomment for query param updates
  // const searchParams = useSearchParams() // TODO: Uncomment for reading query params

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<{ type: string; status: string }>({ type: '', status: '' })
  const [sort, setSort] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'receivedAt',
    sortOrder: 'desc',
  })
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false) // For mobile filter panel

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
        throw new Error(errorData.message || t('errors.fetchFailed'))
      }
      const data = await response.json()
      console.log('[NotificationsPage] API Success Response Data:', data) // Added log
      setNotifications(data.items || [])
      setTotalPages(data.totalPages || 1)
      // setCurrentPage(data.currentPage || 1) // Also ensure currentPage from API is used if available
    } catch (err) {
      console.error('[NotificationsPage] Fetch Error:', err) // Added log
      setError(err instanceof Error ? err.message : t('errors.unknown'))
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filters, sort, lang, t]) // lang dependency might not be needed if translations are stable per load

  // Sort configuration (moved from NotificationTopBar)
  const sortableFields = [
    { value: 'receivedAt', label: tControls('sortBy.receivedAt') },
    { value: 'title', label: tControls('sortBy.title') },
  ]

  const handleSortByChange = (value: string) => {
    handleSortChange({ ...sort, sortBy: value })
  }

  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    handleSortChange({ ...sort, sortOrder: value })
  }

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
      if (!response.ok) throw new Error(t('errors.markReadFailed'))
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n)))
    } catch (err) {
      console.error('Failed to mark as read:', err)
      // TODO: Show toast notification
    }
  }

  const markAsUnread = async (id: string) => {
    try {
      // Note: The API endpoint for marking as unread might be different.
      // Assuming '/api/notifications/:id/unread' based on NotificationItem.tsx
      const response = await fetch(`${API_BASE_URL}/${id}/unread`, { method: 'POST' })
      if (!response.ok) throw new Error(t('errors.markUnreadFailed'))
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'unread' } : n)))
    } catch (err) {
      console.error('Failed to mark as unread:', err)
      // TODO: Show toast notification
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mark-all-as-read`, { method: 'POST' })
      if (!response.ok) throw new Error(t('errors.markAllReadFailed'))
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      // TODO: Show toast notification
    }
  }

  const deleteNotification = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(t('errors.deleteFailed'))
      fetchNotifications()
    } catch (err) {
      console.error('Failed to delete notification:', err)
      // TODO: Show toast notification
    }
  }

  const deleteAllNotifications = async () => {
    if (!confirm(t('confirmDeleteAll'))) return
    try {
      const response = await fetch(`${API_BASE_URL}/all`, { method: 'DELETE' })
      if (!response.ok) throw new Error(t('errors.deleteAllFailed'))
      fetchNotifications()
    } catch (err) {
      console.error('Failed to delete all notifications:', err)
      // TODO: Show toast notification
    }
  }

  const deleteReadNotifications = async () => {
    if (!confirm(t('confirmDeleteRead'))) return
    try {
      const response = await fetch(`${API_BASE_URL}/read`, { method: 'DELETE' })
      if (!response.ok) throw new Error(t('errors.deleteReadFailed'))
      fetchNotifications()
    } catch (err) {
      console.error('Failed to delete read notifications:', err)
      // TODO: Show toast notification
    }
  }

  const toggleFilterPanel = () => setIsFilterPanelOpen(!isFilterPanelOpen)

  // Updated loading state to use skeleton loaders
  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Placeholder for header during initial full page load skeleton */}
        <header className="bg-card border-b sticky top-0 z-30 shadow-sm h-16">
          <div className="container mx-auto flex items-center justify-between h-full px-4">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse hidden md:block"></div>
              <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </header>
        <div className="flex flex-col md:grid md:grid-cols-[288px_1fr] flex-1 overflow-hidden container mx-auto gap-x-6">
          <div className="hidden md:block md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-72 md:border-r md:z-10 md:col-start-1 bg-background p-4 space-y-4">
            <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4"></div>
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <main className="flex-1 overflow-y-auto md:col-start-2 pt-16 md:pt-0">
            <div className="p-4 md:p-6 space-y-6 mt-0 md:mt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <NotificationSkeletonItem key={index} />
              ))}
            </div>
          </main>
        </div>
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
    <div className="flex flex-col h-screen bg-background relative">
      {/* CSS стили для анимаций */}
      <SkeletonStyles />

      {/* Фоновый градиент для улучшения визуального восприятия */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-purple-50/10 dark:from-blue-950/5 dark:to-purple-950/5 pointer-events-none z-0" />

      {/* New Compact Fixed Page Header */}
      <header className="bg-card/90 backdrop-blur-sm border-b sticky top-0 z-30 shadow-sm h-16 relative">
        <div className="container mx-auto flex items-center justify-between h-full px-4">
          {/* Left Side: Title */}
          <motion.h1
            className="text-xl font-semibold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {t('pageTitle')}
          </motion.h1>

          {/* Right Side: Actions & Controls */}
          <motion.div
            className="flex items-center gap-2 md:gap-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Display Mode Switcher */}
            <Button
              variant={filters.status === '' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange({ ...filters, status: '' })}
            >
              {tControls('status.all')}
            </Button>
            <Button
              variant={filters.status === 'unread' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange({ ...filters, status: 'unread' })}
            >
              {tControls('status.unread')}
            </Button>

            {/* Sort By Select */}
            <div className="hidden md:flex items-center gap-2">
              <Label htmlFor="sort-by-header" className="text-sm sr-only">
                {tControls('sortByLabel')}
              </Label>
              <Select value={sort.sortBy} onValueChange={handleSortByChange}>
                <SelectTrigger id="sort-by-header" className="h-9 min-w-[130px] text-xs">
                  <SelectValue placeholder={tControls('selectSortFieldPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {sortableFields.map((field) => (
                    <SelectItem key={field.value} value={field.value} className="text-xs">
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Order Select */}
              <Label htmlFor="sort-order-header" className="text-sm sr-only">
                {tControls('sortOrderLabel')}
              </Label>
              <Select
                value={sort.sortOrder}
                onValueChange={(value) => handleSortOrderChange(value as 'asc' | 'desc')}
              >
                <SelectTrigger id="sort-order-header" className="h-9 min-w-[90px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc" className="text-xs">
                    {tControls('sortOrder.asc')}
                  </SelectItem>
                  <SelectItem value="desc" className="text-xs">
                    {tControls('sortOrder.desc')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mark all as read Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="hidden md:inline-flex"
            >
              {tControls('markAllRead')}
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{tTopBar('moreActions')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* --- Mobile Only Section --- */}
                <div className="md:hidden">
                  <DropdownMenuItem onClick={markAllAsRead}>
                    {tControls('markAllRead')}
                  </DropdownMenuItem>
                  {/* Mobile Sort Controls */}
                  <div className="p-2 space-y-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="sort-by-dropdown-mobile"
                        className="text-xs px-1 text-muted-foreground"
                      >
                        {tControls('sortByLabel')}
                      </Label>
                      <Select value={sort.sortBy} onValueChange={handleSortByChange}>
                        <SelectTrigger id="sort-by-dropdown-mobile" className="h-9 w-full text-xs">
                          <SelectValue placeholder={tControls('selectSortFieldPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {sortableFields.map((field) => (
                            <SelectItem key={field.value} value={field.value} className="text-xs">
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="sort-order-dropdown-mobile"
                        className="text-xs px-1 text-muted-foreground"
                      >
                        {tControls('sortOrderLabel')}
                      </Label>
                      <Select
                        value={sort.sortOrder}
                        onValueChange={(value) => handleSortOrderChange(value as 'asc' | 'desc')}
                      >
                        <SelectTrigger
                          id="sort-order-dropdown-mobile"
                          className="h-9 w-full text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc" className="text-xs">
                            {tControls('sortOrder.asc')}
                          </SelectItem>
                          <SelectItem value="desc" className="text-xs">
                            {tControls('sortOrder.desc')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DropdownMenuSeparator /> {/* Separator after all mobile-specific items */}
                </div>
                {/* --- End Mobile Only Section --- */}
                {/* Common Actions (visible on all screen sizes within dropdown) */}
                <DropdownMenuItem onClick={deleteReadNotifications}>
                  {tControls('deleteRead')}
                </DropdownMenuItem>
                <DropdownMenuSeparator /> {/* This separator was originally at line 357 */}
                <DropdownMenuItem
                  onClick={deleteAllNotifications}
                  className="text-destructive hover:!text-destructive-foreground hover:!bg-destructive"
                >
                  {tControls('deleteAll')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => alert(t('settings') + ' ' + t('comingSoon'))}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">{t('settings')}</span>
            </Button>

            {/* Mobile Filter Panel Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={toggleFilterPanel}
            >
              {isFilterPanelOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              <span className="sr-only">
                {isFilterPanelOpen ? t('closeFilters') : t('openFilters')}
              </span>
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Adjusted layout: Header is h-16 (4rem). Sidebar and Main content need to account for this. */}
      <div className="flex flex-col md:grid md:grid-cols-[288px_1fr] flex-1 overflow-hidden container mx-auto gap-x-6 relative z-10">
        {/* Desktop Sidebar */}
        <motion.div
          className="
            hidden md:block md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-72 md:border-r md:z-10 md:col-start-1 bg-background/70 backdrop-blur-sm
          "
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="h-full overflow-y-auto">
            <NotificationFilterSidebar
              onFilterChange={handleFilterChange}
              currentFilters={filters}
              isMobilePanel={false}
            />
          </div>
        </motion.div>

        {/* Mobile Filter Panel (Bottom Sheet) */}
        {isFilterPanelOpen && (
          <>
            {/* Backdrop for mobile filter panel */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={toggleFilterPanel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            {/* Panel Content */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-40 w-full bg-background border-t shadow-lg rounded-t-2xl overflow-hidden md:hidden"
              style={{ maxHeight: '80vh' }} // Prevent panel from taking full screen
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-4 flex justify-between items-center border-b">
                <h3 className="text-lg font-semibold">{t('filtersTitle')}</h3>
                <Button variant="ghost" size="icon" onClick={toggleFilterPanel}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">{t('closeFilters')}</span>
                </Button>
              </div>
              <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 100px)' }}>
                {' '}
                {/* Adjust 100px based on header/footer of panel */}
                <NotificationFilterSidebar
                  onFilterChange={handleFilterChange}
                  currentFilters={filters}
                  onApplyFilters={() => setIsFilterPanelOpen(false)} // Optionally close panel on apply
                  isMobilePanel={true}
                />
              </div>
            </motion.div>
          </>
        )}

        {/* Main Content Area - Adjusted for new header, removed NotificationTopBar wrapper */}
        {/* The main content area itself will be scrollable, starting below the h-16 header */}
        <motion.main
          className="flex-1 overflow-y-auto md:col-start-2 pt-16 md:pt-0 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {' '}
          {/* pt-16 for content to clear fixed header on mobile, md:pt-0 as grid handles it */}
          {/* Content starts after the sticky header. The main element itself is scrollable. */}
          <div className="p-4 md:p-6 space-y-6 mt-0 md:mt-4">
            {' '}
            {/* Removed sticky wrapper for TopBar, adjusted margin for content start */}
            {/* Loading indicator for subsequent loads (e.g. pagination, filter change) */}
            {isLoading && notifications.length > 0 && (
              <div className="flex justify-center items-center py-4">
                {/* Using skeleton for "loading more" state as well for consistency */}
                <div className="w-full space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <NotificationSkeletonItem key={`loading-more-${index}`} />
                  ))}
                </div>
              </div>
            )}
            {/* Empty State */}
            {!isLoading && notifications.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-center py-10 md:py-20 min-h-[calc(100vh-20rem)]" // Ensure it takes considerable space
              >
                <Inbox className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('emptyState.title')}
                </h3>
                <p className="text-muted-foreground max-w-md">{t('emptyState.message')}</p>
                {/* Optional: Add a button or link here, e.g., to refresh or go to settings */}
                {/* <Button variant="outline" className="mt-6" onClick={fetchNotifications}>
                  {t('emptyState.refresh')}
                </Button> */}
              </motion.div>
            )}
            {/* Notification List with Animations */}
            <AnimatePresence mode="wait">
              {notifications.length > 0 &&
                !isLoading && ( // Ensure not loading when rendering list
                  <motion.div
                    key={currentPage + filters.type + filters.status + sort.sortBy + sort.sortOrder} // Re-trigger animation on filter/sort/page change
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <NotificationList
                      notifications={notifications}
                      onMarkAsRead={markAsRead}
                      onMarkAsUnread={markAsUnread} // Added this prop
                      onDelete={deleteNotification}
                      lang={lang}
                    />
                  </motion.div>
                )}
            </AnimatePresence>
            {totalPages > 1 &&
              !isLoading && ( // Hide pagination when loading
                <div className="pt-4">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export default NotificationsPageContent
