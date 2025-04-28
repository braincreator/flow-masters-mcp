'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import {
  BookOpen,
  Award,
  Gift,
  Clock,
  CheckCircle,
  Calendar,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react'

interface ActivityFeedProps {
  userId: string
  locale: string
  limit?: number
}

interface ActivityApiResponse {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  meta?: Record<string, unknown>
}

interface ActivityItem {
  id: string
  type: 'course_progress' | 'achievement' | 'reward' | 'comment' | 'like' | 'certificate'
  title: string
  description: string
  timestamp: string
  meta?: {
    courseId?: string
    courseName?: string
    achievementId?: string
    achievementName?: string
    rewardId?: string
    rewardName?: string
    lessonId?: string
    lessonName?: string
    commentId?: string
    postId?: string
    postTitle?: string
  }
}

export function ActivityFeed({ userId, locale, limit = 5 }: ActivityFeedProps) {
  const t = useTranslations('ActivityFeed')
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { refreshAuth } = useAuth()

  useEffect(() => {
    const fetchActivities = async (retryAfterRefresh = false) => {
      try {
        setIsLoading(true)

        console.log(`Fetching activities for user ${userId} with limit ${limit}`)

        // Fetch real activity data from the API
        const response = await fetch(`/api/v1/user/${userId}/activity?limit=${limit}`, {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
        })

        console.log(`Activity API response status: ${response.status}`)

        if (!response.ok) {
          // If we get a 401 or 403 and haven't retried yet, try refreshing auth and retrying
          if ((response.status === 401 || response.status === 403) && !retryAfterRefresh) {
            console.warn('Authentication error, refreshing auth and retrying...')
            await refreshAuth()
            return fetchActivities(true) // Retry with the retryAfterRefresh flag set to true
          }

          // For 500 errors, try to get more details from the response
          if (response.status === 500) {
            try {
              const errorData = await response.json()
              console.error('Server error details:', errorData)
              throw new Error(`Server error: ${errorData.error || 'Unknown server error'}`)
            } catch (_parseError) {
              // If we can't parse the error response, just use the status code
              throw new Error(`Failed to fetch activities: ${response.status}`)
            }
          } else {
            throw new Error(`Failed to fetch activities: ${response.status}`)
          }
        }

        const result = await response.json()
        console.log(`Received ${result.data?.length || 0} activities from API`)

        if (result.success && Array.isArray(result.data)) {
          // Map the API response to our activity items
          const mappedActivities = result.data
            .map((item: ActivityApiResponse) => {
              try {
                if (!item || !item.id || !item.type || !item.timestamp) {
                  console.warn('Skipping invalid activity item:', item)
                  return null
                }

                return {
                  id: item.id,
                  type: item.type,
                  // Translate the title key
                  title: t(item.title || 'unknownActivity'),
                  description: item.description || '',
                  timestamp: item.timestamp,
                  meta: item.meta || {},
                }
              } catch (mapError) {
                console.error('Error mapping activity item:', mapError, item)
                return null
              }
            })
            .filter(Boolean) // Remove any null items

          setActivities(mappedActivities)
        } else {
          // If no activities or error, set empty array
          setActivities([])
          console.warn('No activities found or invalid response format:', result)
        }
      } catch (error) {
        console.error('Error fetching activity feed:', error)

        // Show a more user-friendly error in development
        if (process.env.NODE_ENV === 'development') {
          alert(
            `Error fetching activities: ${error instanceof Error ? error.message : String(error)}`,
          )
        }

        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchActivities()
    } else {
      setIsLoading(false)
      setActivities([])
    }
  }, [userId, limit, t, locale, refreshAuth])

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHour = Math.round(diffMin / 60)
    const diffDay = Math.round(diffHour / 24)

    if (diffSec < 60) return t('justNow')
    if (diffMin < 60) return diffMin === 1 ? t('minuteAgo') : t('minutesAgo', { minutes: diffMin })
    if (diffHour < 24) return diffHour === 1 ? t('hourAgo') : t('hoursAgo', { hours: diffHour })
    if (diffDay < 30) return diffDay === 1 ? t('dayAgo') : t('daysAgo', { days: diffDay })

    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
    })
  }

  // Get icon based on activity type
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'course_progress':
        return <BookOpen className="w-5 h-5 text-blue-500" />
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />
      case 'reward':
        return <Gift className="w-5 h-5 text-purple-500" />
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-green-500" />
      case 'like':
        return <ThumbsUp className="w-5 h-5 text-red-500" />
      case 'certificate':
        return <CheckCircle className="w-5 h-5 text-teal-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayActivities = activities.slice(0, limit)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="p-4 hover:bg-muted/50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-muted-foreground text-sm truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {activities.length > limit && (
          <div className="p-4 text-center">
            <Link
              href={`/${locale}/account/activity`}
              className="text-sm text-primary hover:underline"
            >
              {t('viewMore')}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
