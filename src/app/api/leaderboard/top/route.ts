import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5', 10)
    
    // Получаем топ пользователей
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const leaderboardService = serviceRegistry.getLeaderboardService()
    const topUsers = await leaderboardService.getTopUsers(limit)
    
    return NextResponse.json(topUsers)
  } catch (error) {
    console.error('Error fetching top users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top users' },
      { status: 500 }
    )
  }
}
