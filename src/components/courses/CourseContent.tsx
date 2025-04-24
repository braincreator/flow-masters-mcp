'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { LessonNavigation } from './LessonNavigation'
import { LessonViewer } from './LessonViewer'

interface CourseContentProps {
  course: any
  modules: any[]
  progress: number
  updateProgress: (progress: number) => void
}

export function CourseContent({ course, modules, progress, updateProgress }: CourseContentProps) {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(
    modules.length > 0 ? modules[0].id : null,
  )
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    modules.length > 0 && modules[0].lessons?.length > 0 ? modules[0].lessons[0].id : null,
  )
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [activeLesson, setActiveLesson] = useState<any>(null)

  // Load the active lesson when module or lesson ID changes
  useEffect(() => {
    if (activeModuleId && activeLessonId) {
      const lesson = findLesson(modules, activeLessonId)
      setActiveLesson(lesson)
    }
  }, [modules, activeModuleId, activeLessonId])

  // Handle lesson selection
  const handleLessonSelect = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId)
    setActiveLessonId(lessonId)
  }

  // Mark a lesson as complete
  const markLessonComplete = () => {
    if (!activeLessonId) return

    const newCompletedLessons = new Set(completedLessons)
    newCompletedLessons.add(activeLessonId)
    setCompletedLessons(newCompletedLessons)

    // Calculate new progress
    let totalLessons = 0
    let completedCount = 0

    modules.forEach((module) => {
      if (module.lessons && Array.isArray(module.lessons)) {
        totalLessons += module.lessons.length
        module.lessons.forEach((lesson) => {
          if (newCompletedLessons.has(lesson.id)) {
            completedCount++
          }
        })
      }
    })

    const newProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    updateProgress(newProgress)
  }

  // Find the next lesson
  const findNextLesson = () => {
    let allLessons: { moduleId: string; lessonId: string }[] = []

    modules.forEach((module) => {
      if (module.lessons && Array.isArray(module.lessons)) {
        module.lessons.forEach((lesson) => {
          allLessons.push({ moduleId: module.id, lessonId: lesson.id })
        })
      }
    })

    const currentIndex = allLessons.findIndex(
      (item) => item.moduleId === activeModuleId && item.lessonId === activeLessonId,
    )

    if (currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1]
    }

    return null
  }

  // Handle moving to the next lesson
  const handleNextLesson = () => {
    const next = findNextLesson()
    if (next) {
      handleLessonSelect(next.moduleId, next.lessonId)
    }
  }

  if (modules.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p>No content available for this course yet.</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 h-[calc(100vh-300px)] lg:h-[calc(100vh-200px)] overflow-hidden flex flex-col">
        <LessonNavigation
          courseId={course.id}
          courseSlug={course.slug}
          modules={modules}
          currentModuleId={activeModuleId}
          currentLessonId={activeLessonId}
          completedLessons={completedLessons}
          onLessonSelect={handleLessonSelect}
          className="h-full"
        />
      </div>

      <div className="lg:col-span-3 h-[calc(100vh-300px)] lg:h-[calc(100vh-200px)] overflow-hidden">
        <LessonViewer
          lesson={activeLesson}
          isCompleted={activeLessonId ? completedLessons.has(activeLessonId) : false}
          onComplete={markLessonComplete}
          onNext={handleNextLesson}
        />
      </div>
    </div>
  )
}

function findLesson(modules: any[], lessonId: string) {
  for (const module of modules) {
    if (module.lessons && Array.isArray(module.lessons)) {
      const lesson = module.lessons.find((l) => l.id === lessonId)
      if (lesson) return lesson
    }
  }
  return null
}
