import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getAuth } from '../helpers/auth'
import config from '@/payload.config'
import { TaskItem, TaskStatus, TaskPriority, TaskStats, CreateTaskRequest } from '@/types/tasks'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
let cachedPayload = null

async function getPayloadInstance() {
  if (cachedPayload) {
    return cachedPayload
  }
  cachedPayload = await getPayload({ config })
  return cachedPayload
}

// Helper function to calculate task statistics
function calculateTaskStats(tasks: TaskItem[]): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    byStatus: {
      todo: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
    overdue: 0,
    completedThisWeek: 0,
    averageCompletionTime: 0,
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  let totalCompletionTime = 0
  let completedTasksCount = 0

  tasks.forEach(task => {
    // Count by status
    stats.byStatus[task.status]++

    // Count by priority
    stats.byPriority[task.priority]++

    // Count overdue tasks
    if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
      stats.overdue++
    }

    // Count completed this week
    if (task.status === 'completed' && task.completedAt && new Date(task.completedAt) > weekAgo) {
      stats.completedThisWeek++
    }

    // Calculate average completion time
    if (task.status === 'completed' && task.completedAt) {
      const completionTime = new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()
      totalCompletionTime += completionTime
      completedTasksCount++
    }
  })

  if (completedTasksCount > 0) {
    stats.averageCompletionTime = Math.round(totalCompletionTime / completedTasksCount / (1000 * 60 * 60 * 24)) // in days
  }

  return stats
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
    const status = url.searchParams.get('status') as TaskStatus
    const priority = url.searchParams.get('priority') as TaskPriority
    const assignedTo = url.searchParams.get('assignedTo')
    const search = url.searchParams.get('search')

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

    // Build query conditions
    const whereConditions: any = {
      project: { equals: projectId },
    }

    if (status) {
      whereConditions.status = { equals: status }
    }

    if (assignedTo) {
      whereConditions['assignedTo.id'] = { equals: assignedTo }
    }

    if (search) {
      whereConditions.or = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const tasksResponse = await payload.find({
      collection: 'tasks',
      where: whereConditions,
      sort: '-createdAt',
      depth: 2, // Include related data
    })

    // Transform tasks to match our interface
    const tasks: TaskItem[] = tasksResponse.docs.map(task => ({
      id: task.id,
      title: task.name,
      description: task.description || '',
      status: task.status as TaskStatus,
      priority: (task.priority as TaskPriority) || 'medium',
      progress: task.progress || 0,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      projectId: projectId,
      assignedTo: task.assignedTo ? {
        id: task.assignedTo.id,
        name: task.assignedTo.name,
        email: task.assignedTo.email,
      } : undefined,
      tags: task.tags || [],
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      comments: task.comments || [],
      attachments: task.attachments || [],
      activities: task.activities || [],
    }))

    // If no tasks exist, return sample tasks for demonstration
    if (tasks.length === 0) {
      const sampleTasks: TaskItem[] = [
        {
          id: 'task-1',
          title: 'Анализ требований',
          description: 'Провести детальный анализ технических требований проекта',
          status: 'completed',
          priority: 'high',
          progress: 100,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          projectId,
          assignedTo: {
            id: 'user-1',
            name: 'Аналитик',
            email: 'analyst@example.com',
          },
          tags: ['analysis', 'requirements'],
          estimatedHours: 16,
          actualHours: 14,
          comments: [],
          attachments: [],
          activities: [],
        },
        {
          id: 'task-2',
          title: 'Разработка архитектуры',
          description: 'Создание архитектурной схемы системы',
          status: 'in_progress',
          priority: 'high',
          progress: 65,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          projectId,
          assignedTo: {
            id: 'user-2',
            name: 'Архитектор',
            email: 'architect@example.com',
          },
          tags: ['architecture', 'design'],
          estimatedHours: 24,
          actualHours: 16,
          comments: [],
          attachments: [],
          activities: [],
        },
        {
          id: 'task-3',
          title: 'Настройка CI/CD',
          description: 'Настройка пайплайна непрерывной интеграции и развертывания',
          status: 'todo',
          priority: 'medium',
          progress: 0,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          projectId,
          assignedTo: {
            id: 'user-3',
            name: 'DevOps инженер',
            email: 'devops@example.com',
          },
          tags: ['devops', 'automation'],
          estimatedHours: 12,
          comments: [],
          attachments: [],
          activities: [],
        },
        {
          id: 'task-4',
          title: 'Тестирование безопасности',
          description: 'Проведение аудита безопасности и исправление уязвимостей',
          status: 'review',
          priority: 'urgent',
          progress: 90,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // overdue
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          projectId,
          assignedTo: {
            id: 'user-4',
            name: 'Тестировщик',
            email: 'tester@example.com',
          },
          tags: ['security', 'testing'],
          estimatedHours: 20,
          actualHours: 18,
          comments: [],
          attachments: [],
          activities: [],
        },
      ]

      const stats = calculateTaskStats(sampleTasks)
      return NextResponse.json({ tasks: sampleTasks, stats })
    }

    const stats = calculateTaskStats(tasks)
    return NextResponse.json({ tasks, stats })
  } catch (error) {
    logError('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// Create new task
export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateTaskRequest = await req.json()
    const { projectId, title, description, status, priority, dueDate, assignedTo, tags, estimatedHours } = body

    if (!projectId || !title) {
      return NextResponse.json({ error: 'Project ID and title are required' }, { status: 400 })
    }

    const payload = await getPayloadInstance()

    // Check if user has access to this project
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

    // Create the task
    const newTask = await payload.create({
      collection: 'tasks',
      data: {
        name: title,
        description: description || '',
        status: status || 'todo',
        priority: priority || 'medium',
        progress: 0,
        project: projectId,
        dueDate,
        assignedTo,
        tags: tags?.map(tag => ({ tag })) || [],
        estimatedHours: estimatedHours || 0,
      },
    })

    // Transform to match our interface
    const taskItem: TaskItem = {
      id: newTask.id,
      title: newTask.name,
      description: newTask.description || '',
      status: newTask.status as TaskStatus,
      priority: (newTask.priority as TaskPriority) || 'medium',
      progress: newTask.progress || 0,
      createdAt: newTask.createdAt,
      updatedAt: newTask.updatedAt,
      dueDate: newTask.dueDate,
      projectId: projectId,
      assignedTo: newTask.assignedTo ? {
        id: newTask.assignedTo.id,
        name: newTask.assignedTo.name,
        email: newTask.assignedTo.email,
      } : undefined,
      tags: newTask.tags?.map((t: any) => t.tag) || [],
      estimatedHours: newTask.estimatedHours || 0,
      comments: [],
      attachments: [],
      activities: [],
    }

    return NextResponse.json(taskItem, { status: 201 })
  } catch (error) {
    logError('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

