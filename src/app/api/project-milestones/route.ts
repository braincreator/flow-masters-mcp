import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '../helpers/auth'
import { getPayloadClient } from '@/utilities/payload/index'

// Получение списка этапов проекта
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

    // Get the Payload client
    const payload = await getPayloadClient()

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
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Получаем этапы проекта
    const milestonesResponse = await payload.find({
      collection: 'project-milestones',
      where: {
        project: {
          equals: projectId,
        },
      },
      sort: 'order',
      depth: 2, // Включаем связанные объекты
    })

    return NextResponse.json(milestonesResponse.docs)
  } catch (error) {
    console.error('Error fetching project milestones:', error)
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}

// Создание нового этапа проекта
export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const milestoneData = await req.json()
    const { project: projectId, ...data } = milestoneData

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Get the Payload client
    const payload = await getPayloadClient()

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
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Получаем текущее количество этапов для определения порядка
    const existingMilestones = await payload.find({
      collection: 'project-milestones',
      where: {
        project: {
          equals: projectId,
        },
      },
    })

    // Создаем новый этап
    const newMilestone = await payload.create({
      collection: 'project-milestones',
      data: {
        ...data,
        project: projectId,
        status: data.status || 'not_started',
        priority: data.priority || 'medium',
        progress: data.progress || 0,
        order: existingMilestones.totalDocs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json(newMilestone)
  } catch (error) {
    console.error('Error creating milestone:', error)
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 })
  }
}
