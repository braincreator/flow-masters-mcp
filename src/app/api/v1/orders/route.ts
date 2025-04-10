import { getPayloadClient } from '@/utilities/payload'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const payload = await getPayloadClient()

    // Проверяем, авторизован ли пользователь
    let user = null
    try {
      const userReq = { headers: { authorization: req.headers.get('authorization') } }
      const userRes = await payload.verify(userReq)
      user = userRes?.user
    } catch (error) {
      // Игнорируем ошибки авторизации
    }

    // Если пользователь не авторизован, возвращаем ошибку
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Получаем заказы для данного пользователя
    const orders = await payload.find({
      collection: 'orders',
      where: { user: { equals: user.id } },
      page,
      limit,
      sort: '-createdAt',
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
