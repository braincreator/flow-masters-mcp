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
    
    // Проверяем, имеет ли пользователь доступ к этим данным
    // (только админ или сам пользователь)
    if (session.user.id !== params.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Получаем сервис достижений
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const achievementService = serviceRegistry.getAchievementService()
    const achievementProgress = await achievementService.getUserAchievementProgress(params.id)
    
    return NextResponse.json(achievementProgress)
  } catch (error) {
    logError('Error fetching user achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user achievements' },
      { status: 500 }
    )
  }
}
