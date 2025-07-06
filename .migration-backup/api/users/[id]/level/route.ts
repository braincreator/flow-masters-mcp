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
    
    // Получаем пользователя
    const user = await payload.findByID({
      collection: 'users',
      id: params.id,
    })
    
    // Получаем сервис уровней
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const userLevelService = serviceRegistry.getUserLevelService()
    const levelInfo = userLevelService.getLevelInfo(user.xp || 0)
    
    return NextResponse.json({
      ...levelInfo,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp || 0,
        level: user.level || 1,
      },
    })
  } catch (error) {
    logError('Error fetching user level info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user level info' },
      { status: 500 }
    )
  }
}
