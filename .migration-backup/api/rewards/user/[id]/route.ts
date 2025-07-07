import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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

    // Получаем награды пользователя
    let userRewards = []

    try {
      const serviceRegistry = payload.services
      if (serviceRegistry && typeof serviceRegistry.getRewardService === 'function') {
        const rewardService = serviceRegistry.getRewardService()
        userRewards = await rewardService.getUserRewards(params.id)
      } else {
        // Fallback: Directly query the database if service registry is not available
        logWarn('Service registry not available, using direct database query')
        const result = await payload.find({
          collection: 'user-rewards',
          where: {
            user: {
              equals: params.id,
            },
          },
          sort: '-awardedAt',
          depth: 1,
        })
        userRewards = result.docs
      }
    } catch (error) {
      logError('Error fetching user rewards:', error)
      // Return empty array instead of error to prevent UI from breaking
      userRewards = []
    }

    return NextResponse.json(userRewards)
  } catch (error) {
    logError('Error fetching user rewards:', error)
    return NextResponse.json({ error: 'Failed to fetch user rewards' }, { status: 500 })
  }
}
