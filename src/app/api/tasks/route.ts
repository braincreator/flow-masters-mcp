import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getAuth } from '../helpers/auth'
import config from '@/payload.config'

let cachedPayload = null

async function getPayloadInstance() {
  if (cachedPayload) {
    return cachedPayload
  }
  cachedPayload = await getPayload({ config })
  return cachedPayload
}

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
    const payload = await getPayloadInstance()
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: { equals: projectId },
        or: [{ 'customer.id': { equals: user.id } }, { 'assignedTo.id': { equals: user.id } }],
      },
    })
    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }
    const tasksResponse = await payload.find({
      collection: 'tasks',
      where: {
        project: { equals: projectId },
      },
      sort: '-createdAt',
    })

    // For demo purposes, if no tasks exist, return some sample tasks with date fields
    if (tasksResponse.docs.length === 0) {
      const sampleTasks = [
        {
          id: 'task-1',
          title: 'Настройка базы данных',
          description: 'Создание и настройка структуры базы данных для проекта',
          status: 'completed',
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
          completionDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(), // 22 days ago (completed early)
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: {
            id: 'user-1',
            name: 'Разработчик',
            email: 'dev@example.com',
          },
        },
        {
          id: 'task-2',
          title: 'Создание API эндпоинтов',
          description: 'Разработка REST API для основных функций приложения',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: {
            id: 'user-1',
            name: 'Разработчик',
            email: 'dev@example.com',
          },
        },
        {
          id: 'task-3',
          title: 'Интеграция с внешними сервисами',
          description: 'Подключение к платежным системам и сервисам уведомлений',
          status: 'new',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: {
            id: 'user-1',
            name: 'Разработчик',
            email: 'dev@example.com',
          },
        },
        {
          id: 'task-4',
          title: 'Тестирование безопасности',
          description: 'Проведение аудита безопасности и исправление уязвимостей',
          status: 'new',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (overdue)
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: {
            id: 'user-2',
            name: 'Тестировщик',
            email: 'tester@example.com',
          },
        },
      ]
      return NextResponse.json(sampleTasks)
    }

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
      return NextResponse.json({ error: 'Project ID and title are required' }, { status: 400 })
    }
    const payload = await getPayloadInstance()
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: { equals: projectId },
        or: [{ 'customer.id': { equals: user.id } }, { 'assignedTo.id': { equals: user.id } }],
      },
    })
    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }
    const task = await payload.create({
      collection: 'tasks',
      data: {
        name: title,
        description,
        status,
        project: projectId,
        assignedTo: projectResponse.docs[0].assignedTo?.id || user.id,
      },
    })
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
