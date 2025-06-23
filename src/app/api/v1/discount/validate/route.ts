import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function POST(request: NextRequest) {
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
    const { code, cartTotal } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      )
    }
    
    // Ищем скидку по коду
    const discounts = await payload.find({
      collection: 'discounts',
      where: {
        and: [
          {
            code: {
              equals: code,
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
        ],
      },
    })
    
    if (discounts.docs.length === 0) {
      return NextResponse.json({
        isValid: false,
        message: 'Invalid discount code',
      })
    }
    
    const discount = discounts.docs[0]
    
    // Проверяем, не истек ли срок действия скидки
    const now = new Date()
    
    if (discount.startDate && new Date(discount.startDate) > now) {
      return NextResponse.json({
        isValid: false,
        message: 'Discount is not active yet',
      })
    }
    
    if (discount.endDate && new Date(discount.endDate) < now) {
      return NextResponse.json({
        isValid: false,
        message: 'Discount has expired',
      })
    }
    
    // Проверяем, не превышено ли максимальное количество использований
    if (discount.maxUsage) {
      const usedCount = await payload.find({
        collection: 'orders',
        where: {
          'discount.code': {
            equals: code,
          },
        },
      })
      
      if (usedCount.totalDocs >= discount.maxUsage) {
        return NextResponse.json({
          isValid: false,
          message: 'Discount code has reached maximum usage',
        })
      }
    }
    
    // Проверяем, не превышено ли максимальное количество использований для пользователя
    if (discount.maxUsagePerUser) {
      const usedByUserCount = await payload.find({
        collection: 'orders',
        where: {
          and: [
            {
              'discount.code': {
                equals: code,
              },
            },
            {
              'customer.id': {
                equals: userId,
              },
            },
          ],
        },
      })
      
      if (usedByUserCount.totalDocs >= discount.maxUsagePerUser) {
        return NextResponse.json({
          isValid: false,
          message: 'You have already used this discount code',
        })
      }
    }
    
    // Проверяем, принадлежит ли скидка пользователю (если это скидка из награды)
    if (discount.metadata?.source === 'reward' && discount.metadata?.userId && discount.metadata.userId !== userId) {
      return NextResponse.json({
        isValid: false,
        message: 'This discount code belongs to another user',
      })
    }
    
    // Вычисляем сумму скидки
    let discountAmount = 0
    
    if (discount.type === 'percentage' && discount.value) {
      // Процентная скидка
      discountAmount = (cartTotal * discount.value) / 100
    } else if (discount.type === 'fixed' && discount.value) {
      // Фиксированная скидка
      discountAmount = discount.value
    }
    
    // Проверяем, не превышает ли скидка сумму заказа
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal
    }
    
    return NextResponse.json({
      isValid: true,
      discountAmount,
      discountPercentage: discount.type === 'percentage' ? discount.value : null,
      discountCode: code,
    })
  } catch (error) {
    logError('Error validating discount:', error)
    return NextResponse.json(
      { error: 'Failed to validate discount' },
      { status: 500 }
    )
  }
}
