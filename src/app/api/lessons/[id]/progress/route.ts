import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

export async function POST(
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
    const lessonId = params.id
    
    // Получаем данные из запроса
    const data = await request.json()
    const { courseId } = data
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }
    
    // Проверяем, имеет ли пользователь доступ к курсу
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const enrollmentService = serviceRegistry.getEnrollmentService()
    const hasAccess = await enrollmentService.hasAccessToCourse(userId, courseId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this course' },
        { status: 403 }
      )
    }
    
    // Отмечаем урок как просмотренный
    const lessonProgressService = serviceRegistry.getLessonProgressService()
    const progress = await lessonProgressService.markLessonAsViewed(userId, lessonId, courseId)
    
    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error marking lesson as viewed:', error)
    return NextResponse.json(
      { error: 'Failed to mark lesson as viewed' },
      { status: 500 }
    )
  }
}
