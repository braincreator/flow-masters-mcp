'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Star, Clock, Users, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface RecommendedCoursesProps {
  userId: string
  locale: string
  limit?: number
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  rating: number
  students: number
  estimatedDuration?: string // Changed from duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  trending?: boolean
  new?: boolean
  featuredImage?: {
    url: string
    alt?: string
  }
  tags?: string[]
}

export function RecommendedCourses({ userId, locale, limit = 3 }: RecommendedCoursesProps) {
  const t = useTranslations('RecommendedCourses')
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { refreshAuth } = useAuth()

  useEffect(() => {
    const fetchCourses = async (retryAfterRefresh = false) => {
      try {
        setIsLoading(true)

        // Fetch real recommended courses from the API
        const response = await fetch(`/api/v1/user/${userId}/recommended-courses?limit=${limit}`, {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          // If we get a 401 or 403 and haven't retried yet, try refreshing auth and retrying
          if ((response.status === 401 || response.status === 403) && !retryAfterRefresh) {
            logWarn('Authentication error, refreshing auth and retrying...')
            await refreshAuth()
            return fetchCourses(true) // Retry with the retryAfterRefresh flag set to true
          }
          throw new Error(`Failed to fetch recommended courses: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          setCourses(result.data)
        } else {
          // If no courses or error, set empty array
          setCourses([])
          logWarn('No recommended courses found or invalid response format:', result)
        }

        setIsLoading(false)
      } catch (error) {
        logError('Error fetching recommended courses:', error)
        setCourses([])
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [userId, locale, limit, refreshAuth])

  // Get level badge color
  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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

  const displayCourses = courses.slice(0, limit)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/courses">{t('viewAll')}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/courses/${course.slug}`} className="block group h-full">
                <div className="bg-card rounded-lg overflow-hidden border border-border h-full flex flex-col transition-all duration-200 hover:shadow-md hover:border-primary/20">
                  <div className="relative aspect-[4/3] w-full">
                    {course.featuredImage ? (
                      <Image
                        src={course.featuredImage.url}
                        alt={course.featuredImage.alt || course.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">{t('noImage')}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {course.trending && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 bg-orange-500/90 text-white"
                        >
                          <TrendingUp className="w-3 h-3" />
                          {t('trending')}
                        </Badge>
                      )}
                      {course.new && (
                        <Badge variant="secondary" className="bg-green-500/90 text-white">
                          {t('new')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-2 flex items-center gap-1">
                      <Badge variant="outline" className={getLevelColor(course.level)}>
                        {t(`level.${course.level}`)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{course.estimatedDuration || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
