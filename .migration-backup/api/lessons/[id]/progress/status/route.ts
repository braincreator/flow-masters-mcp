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
    const lessonId = params.id
    
    // Получаем прогресс по уроку
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const lessonProgressService = serviceRegistry.getLessonProgressService()
    const progress = await lessonProgressService.getLessonProgress(userId, lessonId)
    
    return NextResponse.json({
      completed: progress?.status === 'completed',
      progress: progress || null,
    })
  } catch (error) {
    logError('Error getting lesson progress:', error)
    return NextResponse.json(
      { error: 'Failed to get lesson progress' },
      { status: 500 }
    )
  }
}
