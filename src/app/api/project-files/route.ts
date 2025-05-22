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

    console.log('Successfully deleted project-files entry:', deletedFileEntry)

    // TODO: Возможно, стоит также удалять сам медиа-файл, если он больше нигде не используется
    // Note: Deleting the media file itself requires careful consideration to avoid orphaned references.
    // This part is commented out as per the original code's TODO.

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Получение файлов проекта из отдельной коллекции
    const filesResponse = await getPayloadInstance().find({
      collection: 'project-files', // Предполагаем, что файлы хранятся в этой коллекции
      where: {
        project: {
          equals: projectId,
        },
      },
      depth: 1,
      sort: '-createdAt', // Сортировка по дате создания (новые сначала)
    })

    console.log('Successfully deleted project-files entry:', deletedFileEntry)

    // TODO: Возможно, стоит также удалять сам медиа-файл, если он больше нигде не используется
    // Note: Deleting the media file itself requires careful consideration to avoid orphaned references.
    // This part is commented out as per the original code's TODO.

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

    console.log('Successfully deleted project-files entry:', deletedFileEntry)

    // TODO: Возможно, стоит также удалять сам медиа-файл, если он больше нигде не используется
    // Note: Deleting the media file itself requires careful consideration to avoid orphaned references.
    // This part is commented out as per the original code's TODO.

    if (!projectResponse) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Создаем записи в коллекции project-files для каждого файла
    console.log(
      'Attempting to create project-files entries for projectId:',
      projectId,
      'fileIds:',
      fileIds,
    )
    const createdFiles = []
    for (const fileId of fileIds) {
      const fileData = {
        project: projectId,
        file: fileId,
        uploadedBy: user.id,
        category: category || 'default',
      }

      console.log('Creating project-file entry with data:', fileData)
      const createdFile = await payload.create({
        collection: 'project-files',
        data: fileData,
      })

      console.log('Successfully deleted project-files entry:', deletedFileEntry)

      // TODO: Возможно, стоит также удалять сам медиа-файл, если он больше нигде не используется
      // Note: Deleting the media file itself requires careful consideration to avoid orphaned references.
      // This part is commented out as per the original code's TODO.

      console.log('Successfully created project-file entry:', createdFile)
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
    }

    // Возвращаем данные в согласованном формате с GET-запросом
    // Это позволит фронтенду обрабатывать ответы единообразно
    return NextResponse.json({
      success: true,
      docs: createdFiles, // Используем поле docs для соответствия формату Payload CMS
    })

    console.log('Successfully deleted project-files entry:', deletedFileEntry)

    // TODO: Возможно, стоит также удалять сам медиа-файл, если он больше нигде не используется
    // Note: Deleting the media file itself requires careful consideration to avoid orphaned references.
    // This part is commented out as per the original code's TODO.
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

    console.log('DELETE /api/project-files received - projectId:', projectId, 'fileId:', fileId)

    if (!projectId || !fileId) {
      return NextResponse.json({ error: 'Project ID and File ID are required' }, { status: 400 })
    }

    // Проверка доступа к проекту и существования записи project-files

    console.log(
      'Checking access and file entry existence for fileId:',
      fileId,
      'projectId:',
      projectId,
    )

    const fileEntryResponse = await getPayloadInstance().find({
      collection: 'project-files',
      where: {
        id: { equals: fileId },
        project: { equals: projectId },
      },
      depth: 1, // Включаем данные проекта для проверки доступа
    })

    console.log('Successfully deleted project-files entry:', deletedFileEntry)

    // TODO: Возможно, стоит также удалять сам медиа-файл, если он больше нигде не используется
    // Note: Deleting the media file itself requires careful consideration to avoid orphaned references.
    // This part is commented out as per the original code's TODO.

    console.log('File entry check response:', fileEntryResponse)

    if (fileEntryResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 })
    }

    const fileEntry = fileEntryResponse.docs[0]
    const project = fileEntry.project // Получаем данные проекта из связанной записи

    // Проверка прав пользователя на удаление (владелец проекта или назначенный)
    const hasAccess = project.customer.id === user.id || project.assignedTo.id === user.id

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to delete this file' }, { status: 403 })
    }

    // Удаляем запись из project-files
    console.log('Attempting to delete project-files entry with ID:', fileId)
    // Optionally, you might want to log the media file ID here as well if needed for debugging
    // const mediaFileId = fileEntryResponse.docs[0]?.file?.id;
    // console.log('Associated media file ID:', mediaFileId);
    await getPayloadInstance().delete({
      collection: 'project-files',
      id: fileId,
    })

    console.log('Successfully deleted project-files entry:', deletedFileEntry)

    // TODO: Возможно, стоит также удалять сам медиа-файл, если он больше нигде не используется
    // Note: Deleting the media file itself requires careful consideration to avoid orphaned references.
    // This part is commented out as per the original code's TODO.

    // TODO: Возможно, добавить логику удаления самого медиа-файла из коллекции 'media',
    // если это требуется по бизнес-логике (например, если файл больше нигде не используется).
    // Сейчас удаляется только связь файла с проектом.

    console.log('File deletion successful.')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project file:', error.message, error.stack)
    // Log the error object itself for more details
    console.error('Full error object:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete project file' },
      { status: 500 },
    )
  }
}
