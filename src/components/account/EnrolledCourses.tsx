'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface EnrolledCoursesProps {
  userId: string
  locale: string
}

interface Course {
  id: string
  title: string
  slug: string
  featuredImage?: {
    url: string
    alt?: string
  }
  progress?: number
  lastAccessedAt?: string
}

export function EnrolledCourses({ userId, locale }: EnrolledCoursesProps) {
  const t = useTranslations('EnrolledCourses')
  const commonT = useTranslations('common')
  const courseT = useTranslations('courses')

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/courses/user/${userId}`)

        if (!response.ok) {
          throw new Error(t('errorFetchFailed'))
        }

        const data = await response.json()
        setCourses(data.courses || [])
      } catch (err) {
        logError('Error fetching enrolled courses:', err)
        setError(t('errorLoadingCourses'))
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchCourses()
    }
  }, [userId, t])

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('errorTitle')}</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('noCoursesTitle')}</CardTitle>
          <CardDescription>{t('noCoursesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/courses">{t('browseCoursesButton')}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative h-40 w-full">
              {course.featuredImage ? (
                <Image
                  src={course.featuredImage.url}
                  alt={course.featuredImage.alt || course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">{t('noImagePlaceholder')}</span>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>
                {course.lastAccessedAt
                  ? t('lastAccessed', {
                      date: new Date(course.lastAccessedAt).toLocaleDateString(),
                    })
                  : t('notStartedYet')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('progressLabel')}</span>
                  <span>{course.progress || 0}%</span>
                </div>
                <Progress value={course.progress || 0} max={100} />
              </div>
              <Button asChild className="w-full">
                <Link href={`/courses/${course.slug}/learn`}>
                  {course.progress ? courseT('continue') : courseT('startLearning')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button asChild variant="outline">
          <Link href="/courses">{t('browseMoreButton')}</Link>
        </Button>
      </div>
    </div>
  )
}
