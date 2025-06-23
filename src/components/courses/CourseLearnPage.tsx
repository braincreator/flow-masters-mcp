'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, Lock, BookOpen, MessageSquare, FileText } from 'lucide-react'
import { CourseContent } from './CourseContent'
import { CourseOverview } from './CourseOverview'
import { CourseNotes } from './CourseNotes'
import { CourseDiscussion } from './CourseDiscussion'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface CourseLearnPageProps {
  course: any
  modules: any[]
  locale: string
}

export function CourseLearnPage({ course, modules, locale }: CourseLearnPageProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('content')
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    modules.length > 0 && modules[0].lessons?.length > 0 ? modules[0].lessons[0].id : null,
  )

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return

      try {
        setAccessLoading(true)

        // Check if user has access to this course
        const response = await fetch('/api/v1/courses/access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            courseId: course.id,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to check course access')
        }

        const data = await response.json()
        setHasAccess(data.hasAccess)

        // If user has access, get their progress
        if (data.hasAccess) {
          const enrollmentResponse = await fetch(
            `/api/v1/courses/enrollment?userId=${user.id}&courseId=${course.id}`,
          )

          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json()
            if (enrollmentData.enrollment) {
              setProgress(enrollmentData.enrollment.progress || 0)
            }
          }
        }
      } catch (error) {
        logError('Error checking course access:', error)
        setHasAccess(false)
      } finally {
        setAccessLoading(false)
      }
    }

    if (user && course) {
      checkAccess()
    }
  }, [user, course])

  const updateProgress = async (newProgress: number) => {
    if (!user) return

    try {
      const response = await fetch('/api/v1/courses/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          progress: newProgress,
        }),
      })

      if (response.ok) {
        setProgress(newProgress)
      }
    } catch (error) {
      logError('Error updating progress:', error)
    }
  }

  if (isLoading || accessLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="mb-6">Please log in to access this course.</p>
          <Button
            onClick={() =>
              router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
            }
          >
            Log In
          </Button>
        </div>
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Lock className="h-16 w-16 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6">
            You don&apos;t have access to this course. Please purchase the course to gain access.
          </p>
          <Button onClick={() => router.push(`/courses/${course.slug}`)}>
            View Course Details
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <p className="text-gray-600">{course.excerpt}</p>
          <Button variant="outline" onClick={() => router.push(`/courses/${course.slug}`)}>
            Course Details
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Your Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} max={100} className="h-2" />
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="content" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="discussion" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Discussion</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <CourseContent
            course={course}
            modules={modules}
            progress={progress}
            updateProgress={updateProgress}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <CourseOverview course={course} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="h-[calc(100vh-300px)]">
            <CourseNotes courseId={course.id} lessonId={activeLessonId || course.id} />
          </div>
        </TabsContent>

        <TabsContent value="discussion" className="space-y-4">
          <div className="h-[calc(100vh-300px)]">
            <CourseDiscussion courseId={course.id} lessonId={activeLessonId || course.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
