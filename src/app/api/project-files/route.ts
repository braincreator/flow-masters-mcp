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
    const payload = await getPayloadInstance()
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: {
          equals: projectId,
        },
        depth: 1,
        or: [
          {
            'customer.id': {
              equals: user.id,
            },
            depth: 1,
          },
          {
            'assignedTo.id': {
              equals: user.id,
            },
            depth: 1,
          },
        ],
      },
      depth: 1,
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Получение файлов проекта из отдельной коллекции
    const filesResponse = await payload.find({
      collection: 'project-files', // Предполагаем, что файлы хранятся в этой коллекции
      where: {
        project: {
          equals: projectId,
        },
      },
      depth: 1,
      sort: '-createdAt', // Сортировка по дате создания (новые сначала)
    })

    // Возвращаем документы в формате, который ожидает фронтенд
    return NextResponse.json(filesResponse.docs)
  } catch (error) {
    console.error('Error fetching project files:', error.message, error.stack)
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

    if (!projectId || !fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'Project ID and valid file IDs array are required' },
        { status: 400 },
      )
    }

    const payload = await getPayloadInstance()

    // Проверка доступа к проекту
    try {
      const projectResponse = await payload.findByID({
        collection: 'service-projects',
        id: projectId,
        where: {
          or: [
            {
              'customer.id': {
                equals: user.id,
              },
              depth: 1,
            },
            {
              'assignedTo.id': {
                equals: user.id,
              },
              depth: 1,
            },
          ],
        },
        depth: 1,
      })

      if (!projectResponse) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }
    } catch (projectError) {
      console.error('Error checking project access:', projectError)
      return NextResponse.json({ error: 'Failed to verify project access' }, { status: 500 })
    }

    // Проверяем существование файлов перед созданием записей
    const validFileIds = []
    for (const fileId of fileIds) {
      try {
        const fileExists = await payload.findByID({
          collection: 'media',
          id: fileId,
        })

        if (fileExists) {
          validFileIds.push(fileId)
        } else {
          console.warn(`File with ID ${fileId} not found, skipping`)
        }
      } catch (fileError) {
        console.warn(`Error checking file ${fileId}:`, fileError)
        // Пропускаем несуществующие файлы вместо прерывания всей операции
      }
    }

    if (validFileIds.length === 0) {
      return NextResponse.json({ error: 'No valid files found' }, { status: 400 })
    }

    // Создаем записи в коллекции project-files для каждого файла
    const createdFiles = []
    for (const fileId of validFileIds) {
      try {
        const fileData = {
          project: projectId,
          file: fileId,
          uploadedBy: user.id,
          category: category || 'default',
        }

        const createdFile = await payload.create({
          collection: 'project-files',
          data: fileData,
        })

        createdFiles.push(createdFile)

        // Обновляем метаданные файла, если необходимо
        if (category) {
          await payload.update({
            collection: 'media',
            id: fileId,
            data: {
              category: category,
              uploadedBy: user.id,
            },
            depth: 1,
          })
        }
      } catch (createError) {
        console.error(`Error creating project-file for file ${fileId}:`, createError)
        // Продолжаем с другими файлами вместо прерывания всей операции
      }
    }

    // Возвращаем данные в согласованном формате с GET-запросом
    // Это позволит фронтенду обрабатывать ответы единообразно
    return NextResponse.json({
      success: true,
      docs: createdFiles, // Используем поле docs для соответствия формату Payload CMS
    })
  } catch (error) {
    console.error('Error adding files to project:', error.message, error.stack)
    return NextResponse.json({ error: 'Failed to add files to project' }, { status: 500 })
  }
}

// Удаление файла проекта
export async function DELETE(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const projectId = url.searchParams.get('projectId')
    const fileId = url.searchParams.get('fileId') // ID записи в project-files

    if (!projectId || !fileId) {
      return NextResponse.json({ error: 'Project ID and File ID are required' }, { status: 400 })
    }

    // Проверка доступа к проекту и существования записи project-files
    const payload = await getPayloadInstance()

    // Сначала проверяем существование записи project-files
    const fileEntryResponse = await payload.find({
      collection: 'project-files',
      where: {
        id: { equals: fileId },
        project: { equals: projectId },
      },
      depth: 2, // Увеличиваем глубину для получения полных данных о проекте и файле
    })

    if (fileEntryResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 })
    }

    const fileEntry = fileEntryResponse.docs[0]

    // Проверяем, что у нас есть все необходимые данные
    if (!fileEntry.project || !fileEntry.file) {
      console.error('Invalid file entry data:', fileEntry)
      return NextResponse.json({ error: 'Invalid file entry data' }, { status: 500 })
    }

    const project = fileEntry.project // Получаем данные проекта из связанной записи

    // Проверка прав пользователя на удаление (владелец проекта или назначенный)
    let hasAccess = false

    if (project.customer && project.customer.id === user.id) {
      hasAccess = true
    } else if (project.assignedTo && project.assignedTo.id === user.id) {
      hasAccess = true
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to delete this file' }, { status: 403 })
    }

    // Сохраняем ID медиа-файла перед удалением записи
    const mediaFileId = fileEntry.file.id

    if (!mediaFileId) {
      return NextResponse.json({ error: 'Invalid file reference' }, { status: 500 })
    }

    // Удаляем запись из project-files
    await payload.delete({
      collection: 'project-files',
      id: fileId,
    })

    // Проверяем, используется ли медиа-файл еще где-то
    const remainingFileEntries = await payload.find({
      collection: 'project-files',
      where: {
        'file.id': {
          equals: mediaFileId,
        },
      },
    })

    if (remainingFileEntries.totalDocs === 0) {
      // Если медиа-файл больше нигде не используется, удаляем его из коллекции media
      try {
        await payload.delete({
          collection: 'media',
          id: mediaFileId,
        })
        console.log(`Media file ${mediaFileId} deleted successfully`)
      } catch (mediaDeleteError) {
        console.error(
          'Error deleting media file:',
          mediaDeleteError.message,
          mediaDeleteError.stack,
        )
        // Продолжаем выполнение, даже если удаление медиа-файла не удалось
      }
    } else {
      console.log(
        `Media file ${mediaFileId} is still used by other project-files entries. Not deleting.`,
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project file:', error.message, error.stack)
    // Log the error object itself for more details

    return NextResponse.json(
      { error: error.message || 'Failed to delete project file' },
      { status: 500 },
    )
  }
}
