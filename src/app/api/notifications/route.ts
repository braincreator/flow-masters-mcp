import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Проверяем, авторизован ли пользователь
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10', 10) // Match frontend default
    const page = parseInt(searchParams.get('page') || '1', 10)
    const type = searchParams.get('type')
    const status = searchParams.get('status') // 'read', 'unread', or null for 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt' // Default to createdAt
    const sortOrderParam = searchParams.get('sortOrder') || 'desc' // Default to desc

    // Формируем условие запроса
    const whereCondition: any = {
      and: [
        {
          user: {
            equals: userId,
          },
        },
      ],
    }

    if (type) {
      whereCondition.and.push({
        type: {
          equals: type,
        },
      })
    }

    if (status === 'read') {
      whereCondition.and.push({
        isRead: {
          equals: true,
        },
      })
    } else if (status === 'unread') {
      whereCondition.and.push({
        isRead: {
          equals: false,
        },
      })
    }
    // If status is null or empty, no isRead filter is applied (shows all)

    // Получаем payload client
    const payload = await getPayloadClient()

    const sortDirection = sortOrderParam === 'asc' ? '' : '-'
    const sortString = `${sortDirection}${sortBy}`

    console.log('API /notifications: Запрос уведомлений с параметрами:', {
      userId,
      limit,
      page,
      type,
      status,
      sortBy: sortBy,
      sortOrder: sortOrderParam,
      appliedSort: sortString,
      whereCondition: JSON.stringify(whereCondition.and)
    })

    // Получаем уведомления
    const notifications = await payload.find({
      collection: 'notifications',
      where: whereCondition,
      sort: sortString,
      limit,
      page,
      depth: 0,
    })

    console.log(
      `API /notifications: Найдено ${notifications.docs.length} уведомлений из ${notifications.totalDocs} всего`,
    )

    // Подробный лог типов уведомлений
    console.log('API /notifications: Типы уведомлений:', 
      notifications.docs.map(doc => ({ id: doc.id, type: doc.type }))
    )

    // Проверяем, что уведомления имеют нужные поля
    const processedDocs = notifications.docs.map((doc) => {
      // Если какие-то поля отсутствуют, добавим логи
      if (!doc.type) {
        console.warn('API /notifications: Уведомление без поля type:', doc.id)
      }
      if (!doc.title) {
        console.warn('API /notifications: Уведомление без поля title:', doc.id)
      }
      return doc
    })

    return NextResponse.json({ items: processedDocs, totalPages: notifications.totalPages, currentPage: notifications.page })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// Добавим POST-обработчик для создания уведомлений
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Проверяем, авторизован ли пользователь (допускаем разные роли, но требуем аутентификацию)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем данные уведомления
    const notificationData = await request.json()

    // Проверяем обязательные поля
    if (
      !notificationData.userId ||
      !notificationData.title ||
      !notificationData.messageKey ||
      !notificationData.type
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields (userId, title, messageKey, type)',
        },
        { status: 400 },
      )
    }

    // Получаем payload client и сервис уведомлений
    const payload = await getPayloadClient()
    const { ServiceRegistry } = await import('@/services/service.registry')
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const notificationService = serviceRegistry.getNotificationService()

    // Отправляем уведомление
    const success = await notificationService.sendNotification({
      userId: notificationData.userId,
      title: notificationData.title,
      messageKey: notificationData.messageKey,
      messageParams: notificationData.messageParams, // Pass if available, or undefined
      type: notificationData.type,
      link: notificationData.link,
      metadata: notificationData.metadata,
      locale: notificationData.locale || 'ru',
    })

    return NextResponse.json({ success, sent: success.some((result) => result === true) })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Check if the user is authorized (admin)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const idsToDelete: string[] = []
    searchParams.forEach((value, key) => {
      if (key.startsWith('where[and][1][id][in]')) {
        idsToDelete.push(value)
      }
    })

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'No notification IDs provided for deletion' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    const deleteResult = await payload.delete({
      collection: 'notifications',
      where: {
        id: {
          in: idsToDelete,
        },
      },
    })

    // The `delete` operation in Payload typically returns information about the operation,
    // including the number of affected documents, though the exact structure might vary
    // or might not directly return a count of deleted items in a simple way.
    // For now, we'll assume a successful operation means items were deleted if matched.
    // A more robust way might involve checking `deleteResult.docs` if available and its length,
    // or relying on the operation not throwing an error as success.

    // If the `delete` operation doesn't throw, we can assume it's successful.
    // Payload's `delete` might not return the count of deleted items directly in a standard way.
    // We'll return a generic success message or a 204 No Content.
    // If a count is available in `deleteResult.affectedRows` or similar, that could be used.
    // Let's assume for now we don't have a direct count from this operation in a simple form.

    // Option 1: Return 204 No Content (standard for successful DELETE with no body)
    // return new NextResponse(null, { status: 204 })

    // Option 2: Return a message with a potential count (if available, otherwise generic)
    // For this example, let's assume we don't have a precise count from `payload.delete` easily.
    // We can refine this if `deleteResult` structure provides a clear count.
    // A common pattern is to return the number of affected documents if the ORM provides it.
    // If `deleteResult.docs` contained the deleted documents, `deleteResult.docs.length` would be the count.
    // If `deleteResult.count` or `deleteResult.affectedCount` exists, use that.
    // Since the exact return type of payload.delete's result isn't specified for count,
    // we'll return a generic success or 204.
    // For now, let's send a 200 with a message, assuming some items might have been deleted.
    // A more accurate count would require knowing the exact structure of `deleteResult`.
    // Based on typical Payload behavior, `deleteResult.docs` might be an array of affected IDs or objects.
    // If `deleteResult` contains `docs` (array of deleted items) or `errors`:
    let deletedCount = 0;
    if (deleteResult && Array.isArray(deleteResult.docs)) {
      // The `docs` array in BulkOperationResult contains the IDs of the affected documents.
      // So, its length gives the count of successfully processed (in this case, deleted) documents.
      deletedCount = deleteResult.docs.length;
    }
    // The `errors` array in BulkOperationResult contains details about any documents that failed to process.
    // We are already handling `deleteResult.errors` below.
    // If there were errors for some IDs, `deleteResult.errors` might be populated.

    if (deleteResult.errors && deleteResult.errors.length > 0) {
      console.error('Errors during batch deletion:', deleteResult.errors)
      // Decide if this is a partial success or full failure
      return NextResponse.json({ 
        message: 'Some notifications could not be deleted.', 
        errors: deleteResult.errors,
        deletedCount 
      }, { status: 207 }) // Multi-Status
    }

    return NextResponse.json({ message: 'Notifications deleted successfully', count: deletedCount }, { status: 200 })

  } catch (error) {
    console.error('Error deleting notifications:', error)
    let errorMessage = 'Failed to delete notifications'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
