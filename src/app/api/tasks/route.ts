import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../helpers/auth'

// Получение списка задач проекта
export async function GET(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const projectId = url.searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Получаем доступные для пользователя проекты
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: {
          equals: projectId,
        },
        // Проверяем, что пользователь имеет доступ к проекту
        // (либо как заказчик, либо как исполнитель)
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
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Получение задач проекта
    const tasksResponse = await payload.find({
      collection: 'tasks',
      where: {
        'project.id': {
          equals: projectId,
        },
      },
      sort: '-createdAt',
    })

    return NextResponse.json(tasksResponse.docs)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// Создание новой задачи
export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, title, description, status = 'new' } = body

    if (!projectId || !title) {
      return NextResponse.json(
        {
          error: 'Project ID and title are required',
        },
        { status: 400 },
      )
    }

    // Проверка доступа к проекту
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: {
          equals: projectId,
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
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json(
        {
          error: 'Project not found or access denied',
        },
        { status: 404 },
      )
    }

    // Создание задачи
    const task = await payload.create({
      collection: 'tasks',
      data: {
        title,
        description,
        status,
        project: projectId,
        createdBy: user.id,
        // По умолчанию назначаем на исполнителя проекта, если он есть
        assignedTo: projectResponse.docs[0].assignedTo?.id || null,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
