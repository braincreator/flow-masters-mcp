import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../helpers/auth'

// Получение списка проектов пользователя
export async function GET(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем параметры запроса
    const url = new URL(req.url)
    const statusFilter = url.searchParams.get('status') || undefined
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10

    // Формируем условия запроса для получения проектов пользователя
    // (где он заказчик или исполнитель)
    const where: any = {
      or: [
        {
          'customer.id': {
            equals: user.id,
          },
        },
        {
          'assignedTo.id': {
            equals: user.id,
          },
        },
      ],
    }

    // Добавляем фильтр по статусу если указан
    if (statusFilter) {
      where.status = {
        equals: statusFilter,
      }
    }

    // Получаем проекты пользователя
    const projectsResponse = await payload.find({
      collection: 'service-projects',
      where,
      page,
      limit,
      sort: '-updatedAt', // Сортировка по дате обновления (свежие вверху)
      depth: 1, // Включаем связанные объекты первого уровня
    })

    return NextResponse.json(projectsResponse.docs)
  } catch (error) {
    console.error('Error fetching service projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
