import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    // Проверяем, авторизован ли пользователь
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем награду пользователя
    const userReward = await payload.findByID({
      collection: 'user-rewards',
      id: params.id,
    })

    // Проверяем, принадлежит ли награда пользователю
    if (userReward.user !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Проверяем, активна ли награда
    if (userReward.status !== 'active') {
      return NextResponse.json({ error: 'Reward is not active' }, { status: 400 })
    }

    // Используем награду
    let updatedReward

    try {
      const serviceRegistry = payload.services
      if (serviceRegistry && typeof serviceRegistry.getRewardService === 'function') {
        const rewardService = serviceRegistry.getRewardService()
        updatedReward = await rewardService.useReward(params.id)
      } else {
        // Fallback: Directly update the database if service registry is not available
        console.warn('Service registry not available, using direct database update')

        // Get reward details with depth to handle reward type specific logic
        const rewardDetails = await payload.findByID({
          collection: 'user-rewards',
          id: params.id,
          depth: 2,
        })

        // Simple fallback implementation - just mark as used
        updatedReward = await payload.update({
          collection: 'user-rewards',
          id: params.id,
          data: {
            status: 'used',
            usedAt: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      console.error('Error using reward:', error)
      return NextResponse.json(
        {
          error:
            'Failed to use reward: ' + (error instanceof Error ? error.message : 'Unknown error'),
        },
        { status: 500 },
      )
    }

    return NextResponse.json(updatedReward)
  } catch (error) {
    console.error('Error using reward:', error)
    return NextResponse.json({ error: 'Failed to use reward' }, { status: 500 })
  }
}
