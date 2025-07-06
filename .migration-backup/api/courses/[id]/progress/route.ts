import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    // Проверяем, авторизован ли пользователь
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const courseId = params.id
    
    // Получаем запись о зачислении на курс
    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          {
            user: {
              equals: userId,
            },
          },
          {
            course: {
              equals: courseId,
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
        ],
      },
    })
    
    if (enrollments.docs.length === 0) {
      return NextResponse.json(
        { error: 'User is not enrolled in this course' },
        { status: 404 }
      )
    }
    
    const enrollment = enrollments.docs[0]
    
    // Получаем все уроки курса
    const lessons = await payload.find({
      collection: 'lessons',
      where: {
        course: {
          equals: courseId,
        },
      },
    })
    
    // Получаем все просмотренные уроки пользователя в курсе
    const lessonProgress = await payload.find({
      collection: 'lesson-progress',
      where: {
        and: [
          {
            user: {
              equals: userId,
            },
          },
          {
            course: {
              equals: courseId,
            },
          },
          {
            status: {
              equals: 'completed',
            },
          },
        ],
      },
    })
    
    // Создаем карту просмотренных уроков для быстрого поиска
    const completedLessonsMap = new Map()
    lessonProgress.docs.forEach((progress) => {
      completedLessonsMap.set(progress.lesson, progress)
    })
    
    // Добавляем информацию о прогрессе к каждому уроку
    const lessonsWithProgress = lessons.docs.map((lesson) => {
      const isCompleted = completedLessonsMap.has(lesson.id)
      return {
        ...lesson,
        isCompleted,
        completedAt: isCompleted ? completedLessonsMap.get(lesson.id).completedAt : null,
      }
    })
    
    return NextResponse.json({
      enrollment,
      progress: enrollment.progress || 0,
      lessons: lessonsWithProgress,
      completedLessons: lessonProgress.docs.length,
      totalLessons: lessons.docs.length,
    })
  } catch (error) {
    logError('Error fetching course progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course progress' },
      { status: 500 }
    )
  }
}
