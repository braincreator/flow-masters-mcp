import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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

    // Создаем скидку из награды
    let result

    try {
      const serviceRegistry = payload.services
      if (serviceRegistry && typeof serviceRegistry.getRewardDiscountService === 'function') {
        const rewardDiscountService = serviceRegistry.getRewardDiscountService()
        result = await rewardDiscountService.createDiscountFromReward(params.id)
      } else {
        // Fallback: Directly implement discount creation if service registry is not available
        logWarn('Service registry not available, using direct implementation')

        // Get reward details with depth
        const rewardDetails = await payload.findByID({
          collection: 'user-rewards',
          id: params.id,
          depth: 2,
        })

        // Check if it's a discount reward
        const reward = rewardDetails.reward
        if (typeof reward === 'string' || reward.rewardType !== 'discount') {
          return NextResponse.json({ error: 'Reward is not a discount' }, { status: 400 })
        }

        // Generate a discount code
        const discountCode = `RW-${generateDiscountCode()}`

        // Calculate expiration date
        const now = new Date()
        const expirationDate = rewardDetails.expiresAt
          ? new Date(rewardDetails.expiresAt)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days by default

        // Create discount in the system
        await payload.create({
          collection: 'discounts',
          data: {
            code: discountCode,
            type: 'percentage',
            value: reward.discountValue || 10, // Default to 10% if not specified
            startDate: now.toISOString(),
            endDate: expirationDate.toISOString(),
            maxUsage: 1, // One-time discount
            maxUsagePerUser: 1,
            status: 'active',
            metadata: {
              source: 'reward',
              rewardId: reward.id,
              userRewardId: params.id,
              userId: rewardDetails.user,
            },
          },
        })

        // Update reward status
        await payload.update({
          collection: 'user-rewards',
          id: params.id,
          data: {
            status: 'used',
            usedAt: new Date().toISOString(),
            metadata: {
              ...(rewardDetails.metadata || {}),
              discountCode,
            },
          },
        })

        result = {
          success: true,
          discountCode,
        }
      }
    } catch (error) {
      logError('Error creating discount from reward:', error)
      return NextResponse.json(
        {
          error:
            'Failed to create discount: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
        },
        { status: 500 },
      )
    }

    // Helper function to generate a discount code
    function generateDiscountCode() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      return result
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create discount' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      discountCode: result.discountCode,
    })
  } catch (error) {
    logError('Error creating discount from reward:', error)
    return NextResponse.json({ error: 'Failed to create discount from reward' }, { status: 500 })
  }
}
