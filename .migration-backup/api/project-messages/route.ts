import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getAuth } from '../helpers/auth'
import config from '@/payload.config'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
let cachedPayload = null

async function getPayloadInstance() {
  if (cachedPayload) {
    return cachedPayload
  }
  cachedPayload = await getPayload({ config })
  return cachedPayload
}

// Получение списка сообщений проекта
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

    // Проверка доступа к проекту
    const payload = await getPayloadInstance()
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

    // Получение сообщений проекта
    const messagesResponse = await payload.find({
      collection: 'project-messages',
      where: {
        project: {
          equals: projectId,
        },
      },
      sort: 'createdAt', // Старые сначала
      depth: 1, // Включаем связанные данные (автор)
    })

    return NextResponse.json(messagesResponse.docs)
  } catch (error) {
    logError('Error fetching project messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// Создание нового сообщения
export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, content, attachments } = body

    if (!projectId || !content) {
      return NextResponse.json({ error: 'Project ID and content are required' }, { status: 400 })
    }

    // Проверка доступа к проекту
    const payload = await getPayloadInstance()
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

    // Создание сообщения
    const message = await payload.create({
      collection: 'project-messages',
      data: {
        content,
        project: projectId,
        author: user.id,
        isSystemMessage: false,
        attachments: attachments || [],
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    logError('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
