'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/utilities/ui'

interface LessonNavigationProps {
  courseId: string
  courseSlug: string
  modules: any[]
  currentModuleId?: string
  currentLessonId?: string
  completedLessons: Set<string>
  onLessonSelect: (moduleId: string, lessonId: string) => void
  className?: string
}

export function LessonNavigation({
  courseId,
  courseSlug,
  modules,
  currentModuleId,
  currentLessonId,
  completedLessons,
  onLessonSelect,
  className,
}: LessonNavigationProps) {
  const router = useRouter()
  const [expandedModule, setExpandedModule] = useState<string | null>(currentModuleId || null)
  const [progress, setProgress] = useState(0)

  // Calculate overall course progress
  useEffect(() => {
    let totalLessons = 0
    let completedCount = 0

    modules.forEach((module) => {
      if (module.lessons && Array.isArray(module.lessons)) {
        totalLessons += module.lessons.length
        module.lessons.forEach((lesson) => {
          if (completedLessons.has(lesson.id)) {
            completedCount++
          }
        })
      }
    })

    const newProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    setProgress(newProgress)
  }, [modules, completedLessons])

  // Find the next and previous lessons
  const findAdjacentLessons = () => {
    let allLessons: { moduleId: string; lessonId: string }[] = []

    modules.forEach((module) => {
      if (module.lessons && Array.isArray(module.lessons)) {
        module.lessons.forEach((lesson) => {
          allLessons.push({ moduleId: module.id, lessonId: lesson.id })
        })
      }
    })

    const currentIndex = allLessons.findIndex(
      (item) => item.moduleId === currentModuleId && item.lessonId === currentLessonId,
    )

    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    }
  }

  const { prev, next } = findAdjacentLessons()

  const handlePrevious = () => {
    if (prev) {
      onLessonSelect(prev.moduleId, prev.lessonId)
      setExpandedModule(prev.moduleId)
    }
  }

  const handleNext = () => {
    if (next) {
      onLessonSelect(next.moduleId, next.lessonId)
      setExpandedModule(next.moduleId)
    }
  }

  const isLessonAccessible = (moduleIndex: number, lessonIndex: number) => {
    // First module's first lesson is always accessible
    if (moduleIndex === 0 && lessonIndex === 0) return true

    // If previous lesson in same module is completed, this lesson is accessible
    if (lessonIndex > 0) {
      const prevLesson = modules[moduleIndex].lessons[lessonIndex - 1]
      if (completedLessons.has(prevLesson.id)) return true
    }

    // If this is the first lesson of a module (not the first module)
    if (lessonIndex === 0 && moduleIndex > 0) {
      // Check if the last lesson of the previous module is completed
      const prevModule = modules[moduleIndex - 1]
      if (prevModule.lessons && prevModule.lessons.length > 0) {
        const lastLessonOfPrevModule = prevModule.lessons[prevModule.lessons.length - 1]
        return completedLessons.has(lastLessonOfPrevModule.id)
      }
    }

    return false
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Course Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} max={100} className="h-2" />
      </div>

      <div className="flex-grow overflow-auto">
        <Accordion
          type="single"
          collapsible
          value={expandedModule || undefined}
          onValueChange={(value) => setExpandedModule(value)}
          className="w-full"
        >
          {modules.map((module, moduleIndex) => (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="text-left py-3">
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                    {moduleIndex + 1}
                  </span>
                  <span className="font-medium">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 pl-8">
                  {module.lessons && Array.isArray(module.lessons) ? (
                    module.lessons.map((lesson, lessonIndex) => {
                      const isAccessible = isLessonAccessible(moduleIndex, lessonIndex)
                      const isActive =
                        currentModuleId === module.id && currentLessonId === lesson.id
                      const isCompleted = completedLessons.has(lesson.id)

                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => isAccessible && onLessonSelect(module.id, lesson.id)}
                            disabled={!isAccessible}
                            className={cn(
                              'flex items-center gap-2 w-full text-left py-2 px-3 rounded transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                              !isAccessible && 'opacity-50 cursor-not-allowed',
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : !isAccessible ? (
                              <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                          </button>
                        </li>
                      )
                    })
                  ) : (
                    <li className="text-sm text-gray-500 py-2 px-3">No lessons available</li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="flex justify-between mt-4 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!prev}
          className={cn(!prev && 'opacity-50 cursor-not-allowed')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${courseSlug}`)}>
          Course Details
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!next}
          className={cn(!next && 'opacity-50 cursor-not-allowed')}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
