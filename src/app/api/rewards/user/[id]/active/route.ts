import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    // Проверяем, авторизован ли пользователь
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, имеет ли пользователь доступ к этим данным
    // (только админ или сам пользователь)
    if (session.user.id !== params.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Получаем активные награды пользователя
    let activeRewards = []

    try {
      const serviceRegistry = payload.services
      if (serviceRegistry && typeof serviceRegistry.getRewardService === 'function') {
        const rewardService = serviceRegistry.getRewardService()
        activeRewards = await rewardService.getActiveUserRewards(params.id)
      } else {
        // Fallback: Directly query the database if service registry is not available
        console.warn('Service registry not available, using direct database query')
        const result = await payload.find({
          collection: 'user-rewards',
          where: {
            and: [
              {
                user: {
                  equals: params.id,
                },
              },
              {
                status: {
                  equals: 'active',
                },
              },
            ],
          },
          sort: '-awardedAt',
          depth: 1,
        })
        activeRewards = result.docs
      }
    } catch (error) {
      console.error('Error fetching active user rewards:', error)
      // Return empty array instead of error to prevent UI from breaking
      activeRewards = []
    }

    return NextResponse.json(activeRewards)
  } catch (error) {
    console.error('Error fetching active user rewards:', error)
    return NextResponse.json({ error: 'Failed to fetch active user rewards' }, { status: 500 })
  }
}
