import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCourseAnalyticsService } from '@/services/analytics/courseAnalyticsService'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Схема для запроса на отслеживание события
const trackEventSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  userId: z.string().optional(),
  eventType: z.enum([
    'view', 
    'enrollment', 
    'start', 
    'completion', 
    'module_completion', 
    'lesson_completion', 
    'rating', 
    'purchase'
  ]),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
  value: z.number().optional(),
  timeSpent: z.number().optional(),
})

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const courseId = url.searchParams.get('courseId')
    
    const analyticsService = await getCourseAnalyticsService()
    
    if (courseId) {
      // Получаем аналитику для конкретного курса
      const analytics = await analyticsService.getCourseAnalytics(courseId)
      
      return NextResponse.json({
        success: true,
        data: analytics,
      })
    } else {
      // Получаем аналитику для всех курсов
      const analytics = await analyticsService.getAllCoursesAnalytics()
      
      return NextResponse.json({
        success: true,
        data: analytics,
      })
    }
    
  } catch (error) {
    logError('Error fetching course analytics:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const event = trackEventSchema.parse(body)
    
    const analyticsService = await getCourseAnalyticsService()
    
    // Отслеживаем событие
    await analyticsService.trackEvent(event)
    
    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
    })
    
  } catch (error) {
    logError('Error tracking analytics event:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
