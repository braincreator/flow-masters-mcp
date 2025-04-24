import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

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
    
    // Получаем позицию пользователя в лидерборде
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const leaderboardService = serviceRegistry.getLeaderboardService()
    const userRank = await leaderboardService.getUserRank(params.id)
    
    return NextResponse.json(userRank)
  } catch (error) {
    console.error('Error fetching user rank:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user rank' },
      { status: 500 }
    )
  }
}
