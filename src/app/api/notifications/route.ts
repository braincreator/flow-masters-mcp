import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Проверяем, авторизован ли пользователь
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const onlyUnread = searchParams.get('onlyUnread') === 'true'

    // Формируем условие запроса
    const whereCondition: any = {
      and: [
        {
          user: {
            equals: userId,
          },
        },
      ],
    }

    if (onlyUnread) {
      whereCondition.and.push({
        isRead: {
          equals: false,
        },
      })
    }

    // Получаем payload client
    const payload = await getPayloadClient()

    // Получаем уведомления
    const notifications = await payload.find({
      collection: 'notifications',
      where: whereCondition,
      sort: '-createdAt',
      limit,
      page,
    })

    return NextResponse.json(notifications.docs)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
