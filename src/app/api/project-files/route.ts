import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../helpers/auth'

// Получение списка файлов проекта
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

    // Получение проекта с файлами
    const project = await payload.findByID({
      collection: 'service-projects',
      id: projectId,
      depth: 2, // Глубина для получения связанных файлов
    })

    // Получаем отдельно дополнительные файлы проекта (если есть)
    const projectFiles = project.projectFiles || []

    // Формируем ответ с группировкой файлов
    return NextResponse.json({
      specificationFiles: project.specificationFiles || [],
      projectFiles: projectFiles,
    })
  } catch (error) {
    console.error('Error fetching project files:', error)
    return NextResponse.json({ error: 'Failed to fetch project files' }, { status: 500 })
  }
}

// Добавление файлов к проекту
export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, fileIds, category } = body

    if (!projectId || !fileIds || fileIds.length === 0) {
      return NextResponse.json({ error: 'Project ID and file IDs are required' }, { status: 400 })
    }

    // Проверка доступа к проекту
    const projectResponse = await payload.findByID({
      collection: 'service-projects',
      id: projectId,
      where: {
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

    if (!projectResponse) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Получаем текущие файлы проекта
    const currentProjectFiles = projectResponse.projectFiles || []

    // Обновляем проект с новыми файлами
    const updatedProject = await payload.update({
      collection: 'service-projects',
      id: projectId,
      data: {
        projectFiles: [...currentProjectFiles, ...fileIds],
      },
    })

    // Для каждого добавленного файла обновляем метаданные (если необходимо)
    if (category) {
      for (const fileId of fileIds) {
        await payload.update({
          collection: 'media',
          id: fileId,
          data: {
            category: category,
            uploadedBy: user.id,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      projectFiles: updatedProject.projectFiles,
    })
  } catch (error) {
    console.error('Error adding files to project:', error)
    return NextResponse.json({ error: 'Failed to add files to project' }, { status: 500 })
  }
}
