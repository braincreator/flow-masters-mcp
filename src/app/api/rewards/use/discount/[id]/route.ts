import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

export async function POST(
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
    
    // Получаем награду пользователя
    const userReward = await payload.findByID({
      collection: 'user-rewards',
      id: params.id,
    })
    
    // Проверяем, принадлежит ли награда пользователю
    if (userReward.user !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Проверяем, активна ли награда
    if (userReward.status !== 'active') {
      return NextResponse.json(
        { error: 'Reward is not active' },
        { status: 400 }
      )
    }
    
    // Создаем скидку из награды
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const rewardDiscountService = serviceRegistry.getRewardDiscountService()
    const result = await rewardDiscountService.createDiscountFromReward(params.id)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create discount' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      discountCode: result.discountCode,
    })
  } catch (error) {
    console.error('Error creating discount from reward:', error)
    return NextResponse.json(
      { error: 'Failed to create discount from reward' },
      { status: 500 }
    )
  }
}
