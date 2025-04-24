import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
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
    
    // Получаем все активные скидки пользователя
    const discounts = await payload.find({
      collection: 'discounts',
      where: {
        and: [
          {
            status: {
              equals: 'active',
            },
          },
          {
            'metadata.userId': {
              equals: userId,
            },
          },
        ],
      },
    })
    
    // Получаем все активные награды-скидки пользователя
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const rewardDiscountService = serviceRegistry.getRewardDiscountService()
    const discountRewards = await rewardDiscountService.getUserDiscountRewards(userId)
    
    return NextResponse.json({
      discounts: discounts.docs,
      discountRewards,
    })
  } catch (error) {
    console.error('Error fetching user discounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user discounts' },
      { status: 500 }
    )
  }
}
