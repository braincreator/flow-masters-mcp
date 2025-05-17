import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../../helpers/auth'

// Получение деталей конкретного проекта
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Проверяем доступ пользователя к проекту
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: {
          equals: id,
        },
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
      },
      depth: 2, // Включаем связанные объекты
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Возвращаем данные проекта
    return NextResponse.json(projectResponse.docs[0])
  } catch (error) {
    console.error('Error fetching project details:', error)
    return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 500 })
  }
}

// Обновление статуса проекта
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { status } = body

    // Валидируем статус проекта
    const validStatuses = ['new', 'in_progress', 'on_review', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // Проверяем доступ пользователя к проекту и его право на изменение
    // (для простоты MVP, только исполнитель или администратор может менять статус)
    const isAdmin = user.roles?.includes('admin')
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: {
          equals: id,
        },
        ...(isAdmin
          ? {} // Администраторы имеют доступ ко всем проектам
          : {
              'assignedTo.id': {
                equals: user.id, // Только исполнитель может изменить статус
              },
            }),
      },
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Обновляем статус проекта
    const updatedProject = await payload.update({
      collection: 'service-projects',
      id,
      data: {
        status,
      },
    })

    // Создаем системное сообщение об изменении статуса
    await payload.create({
      collection: 'project-messages',
      data: {
        project: id,
        author: user.id,
        isSystemMessage: true,
        content: `Status changed to "${status}"`,
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}
