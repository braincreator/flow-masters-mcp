import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '../../helpers/auth'
import { getPayloadClient } from '@/utilities/payload/index'
import { z } from 'zod'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Schema for validating request parameters
const requestParamsSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
})

// Получение деталей конкретного проекта
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing its properties
    const { id } = await params
    logDebug(`GET /api/service-projects/${id}: Received request`)

    // Получаем пользователя из запроса
    const { user, error: authError } = await getAuth(req)

    if (!user) {
      console.log(`GET /api/service-projects/${id}: No authenticated user found. Error: ${authError || 'Unknown error'}`)
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError || 'Authentication required',
        help: 'Please log in to access this resource'
      }, { status: 401 })
    }

    logDebug(`GET /api/service-projects/${id}: Processing request for user ${user.id}`)

    // Validate and parse request parameters
    let validatedId: string
    try {
      const validated = requestParamsSchema.parse({
        id,
      })
      validatedId = validated.id
      logDebug(`GET /api/service-projects/${id}: Validated ID: ${validatedId}`)
    } catch (validationError) {
      logError('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Get the Payload client
    logDebug(`GET /api/service-projects/${id}: Getting Payload client`)
    const payload = await getPayloadClient()

    // Log available collections for debugging
    logDebug('GET /api/service-projects: Available collections:', Object.keys(payload.collections))

    // Проверяем доступ пользователя к проекту
    logDebug(`GET /api/service-projects/${id}: Fetching project from database`)

    try {
      const projectResponse = await payload.find({
        collection: 'service-projects',
        where: {
          id: {
            equals: validatedId,
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

      logDebug(`GET /api/service-projects/${id}: Found ${projectResponse.totalDocs} projects`)

      if (projectResponse.totalDocs === 0) {
        logDebug(`GET /api/service-projects/${id}: Project not found or access denied`)
        return NextResponse.json({
          error: 'Project not found or access denied',
          details: 'The requested project does not exist or you do not have permission to view it'
        }, { status: 404 })
      }

      // Возвращаем данные проекта
      logDebug(`GET /api/service-projects/${id}: Returning project data`)
      return NextResponse.json(projectResponse.docs[0])
    } catch (findError) {
      logError(`GET /api/service-projects/${id}: Error finding project:`, findError)

      // Check if it's a collection not found error
      const errorMessage = findError instanceof Error ? findError.message : 'Unknown error'
      if (errorMessage.includes("can't be found") || errorMessage.includes("cannot find")) {
        logError('Collection not found error. Checking available collections...')

        try {
          const collections = Object.keys(payload.collections)
          logError('Available collections:', collections)

          return NextResponse.json({
            error: 'Collection not found',
            details: `The collection 'service-projects' could not be found. Available collections: ${collections.join(', ')}`,
            availableCollections: collections
          }, { status: 404 })
        } catch (collectionCheckError) {
          logError('Error checking available collections:', collectionCheckError)
        }
      }

      throw findError; // Re-throw to be caught by the main try-catch
    }
  } catch (error) {
    logError('Error fetching project details:', error)

    // Возвращаем более подробную информацию об ошибке
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    logError('Error details:', { message: errorMessage, stack: errorStack })

    return NextResponse.json({
      error: 'Failed to fetch project details',
      details: errorMessage
    }, { status: 500 })
  }
}

// Обновление статуса проекта
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing its properties
    const { id } = await params
    logDebug(`PATCH /api/service-projects/${id}: Received request`)

    // Получаем пользователя из запроса
    const { user, error: authError } = await getAuth(req)

    if (!user) {
      console.log(`PATCH /api/service-projects/${id}: No authenticated user found. Error: ${authError || 'Unknown error'}`)
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError || 'Authentication required',
        help: 'Please log in to access this resource'
      }, { status: 401 })
    }

    logDebug(`PATCH /api/service-projects/${id}: Processing request for user ${user.id}`)

    // Validate and parse request parameters
    let validatedId: string
    try {
      const validated = requestParamsSchema.parse({
        id,
      })
      validatedId = validated.id
      logDebug(`PATCH /api/service-projects/${id}: Validated ID: ${validatedId}`)
    } catch (validationError) {
      logError('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Parse request body
    let body;
    try {
      body = await req.json()
      logDebug(`PATCH /api/service-projects/${id}: Request body:`, body)
    } catch (parseError) {
      logError('Error parsing request body:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request body',
        details: 'Could not parse request body as JSON'
      }, { status: 400 })
    }

    const { status } = body

    // Валидируем статус проекта
    const validStatuses = ['new', 'in_progress', 'on_review', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      logDebug(`PATCH /api/service-projects/${id}: Invalid status value: ${status}`)
      return NextResponse.json({
        error: 'Invalid status value',
        details: `Status must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 })
    }

    // Get the Payload client
    logDebug(`PATCH /api/service-projects/${id}: Getting Payload client`)
    const payload = await getPayloadClient()

    // Проверяем доступ пользователя к проекту и его право на изменение
    // (для простоты MVP, только исполнитель или администратор может менять статус)
    const isAdmin = user.roles?.includes('admin')
    logDebug(`PATCH /api/service-projects/${id}: User is admin: ${isAdmin}`)

    try {
      logDebug(`PATCH /api/service-projects/${id}: Checking user access to project`)
      const projectResponse = await payload.find({
        collection: 'service-projects',
        where: {
          id: {
            equals: validatedId,
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

      logDebug(`PATCH /api/service-projects/${id}: Found ${projectResponse.totalDocs} projects`)

      if (projectResponse.totalDocs === 0) {
        logDebug(`PATCH /api/service-projects/${id}: Project not found or access denied`)
        return NextResponse.json({
          error: 'Project not found or access denied',
          details: 'The requested project does not exist or you do not have permission to update it'
        }, { status: 404 })
      }

      // Обновляем статус проекта
      logDebug(`PATCH /api/service-projects/${id}: Updating project status to ${status}`)
      const updatedProject = await payload.update({
        collection: 'service-projects',
        id: validatedId,
        data: {
          status,
        },
      })

      // Создаем системное сообщение об изменении статуса
      logDebug(`PATCH /api/service-projects/${id}: Creating system message about status change`)
      await payload.create({
        collection: 'project-messages',
        data: {
          project: validatedId,
          author: user.id,
          isSystemMessage: true,
          content: `Status changed to "${status}"`,
        },
      })

      logDebug(`PATCH /api/service-projects/${id}: Project updated successfully`)
      return NextResponse.json(updatedProject)
    } catch (operationError) {
      logError(`PATCH /api/service-projects/${id}: Error during operation:`, operationError)

      // Check if it's a collection not found error
      const errorMessage = operationError instanceof Error ? operationError.message : 'Unknown error'
      if (errorMessage.includes("can't be found") || errorMessage.includes("cannot find")) {
        logError('Collection not found error. Checking available collections...')

        try {
          const collections = Object.keys(payload.collections)
          logError('Available collections:', collections)

          return NextResponse.json({
            error: 'Collection not found',
            details: `The collection 'service-projects' could not be found. Available collections: ${collections.join(', ')}`,
            availableCollections: collections
          }, { status: 404 })
        } catch (collectionCheckError) {
          logError('Error checking available collections:', collectionCheckError)
        }
      }

      throw operationError; // Re-throw to be caught by the main try-catch
    }
  } catch (error) {
    logError('Error updating project:', error)

    // Возвращаем более подробную информацию об ошибке
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    logError('Error details:', { message: errorMessage, stack: errorStack })

    return NextResponse.json({
      error: 'Failed to update project',
      details: errorMessage
    }, { status: 500 })
  }
}
