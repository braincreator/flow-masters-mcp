import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '../helpers/auth'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Получение списка проектов пользователя
export async function GET(req: NextRequest) {
  try {
    logDebug('GET /api/service-projects: Received request')

    // Получаем пользователя из запроса
    const { user, error: authError } = await getAuth(req)

    if (!user) {
      console.log(`GET /api/service-projects: No authenticated user found. Error: ${authError || 'Unknown error'}`)
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError || 'Authentication required',
        help: 'Please log in to access this resource'
      }, { status: 401 })
    }

    logDebug(`GET /api/service-projects: Processing request for user ${user.id}`)

    // Получаем параметры запроса
    const url = new URL(req.url)
    const statusFilter = url.searchParams.get('status') || undefined
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10

    logDebug(`GET /api/service-projects: Query params - status: ${statusFilter}, page: ${page}, limit: ${limit}`)

    // Формируем условия запроса для получения проектов пользователя
    // (где он заказчик или исполнитель)
    const where: any = {
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
    }

    // Добавляем фильтр по статусу если указан
    if (statusFilter) {
      where.status = {
        equals: statusFilter,
      }
    }

    logDebug(`GET /api/service-projects: Query where condition:`, JSON.stringify(where))

    // Get the Payload client
    logDebug('GET /api/service-projects: Getting Payload client')
    const payload = await getPayloadClient()

    // Log available collections for debugging
    logDebug('GET /api/service-projects: Available collections:', Object.keys(payload.collections))

    // Получаем проекты пользователя
    logDebug('GET /api/service-projects: Fetching projects from database')
    const projectsResponse = await payload.find({
      collection: 'service-projects',
      where,
      page,
      limit,
      sort: '-updatedAt', // Сортировка по дате обновления (свежие вверху)
      depth: 1, // Включаем связанные объекты первого уровня
    })

    logDebug(`GET /api/service-projects: Found ${projectsResponse.docs.length} projects`)

    // Возвращаем результат
    return NextResponse.json(projectsResponse.docs)
  } catch (error) {
    logError('Error fetching service projects:', error)

    // Возвращаем более подробную информацию об ошибке
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    logError('Error details:', { message: errorMessage, stack: errorStack })

    // Проверяем, связана ли ошибка с отсутствием коллекции
    if (errorMessage.includes("can't be found") || errorMessage.includes("cannot find")) {
      logError('Collection not found error. Checking available collections...')

      try {
        // Получаем экземпляр Payload клиента для проверки доступных коллекций
        const payload = await getPayloadClient()
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

    return NextResponse.json({
      error: 'Failed to fetch projects',
      details: errorMessage
    }, { status: 500 })
  }
}
