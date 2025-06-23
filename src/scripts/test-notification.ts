import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
async function main() {
  try {
    logDebug('Initializing PayloadCMS...')
    const payload = await getPayloadClient()
    logDebug('PayloadCMS initialized successfully.')

    // Инициализируем сервисы
    logDebug('Initializing ServiceRegistry...')
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const notificationService = serviceRegistry.getNotificationService()
    logDebug('NotificationService initialized successfully.')

    // ID пользователя для тестирования (должен существовать)
    const TEST_USER_ID = '682521f596cf2ec3dca56c13'

    // Создаем тестовое уведомление
    logDebug(`Creating test notification for user ${TEST_USER_ID}...`)
    const result = await notificationService.sendNotification({
      userId: TEST_USER_ID,
      title: 'Тестовое уведомление',
      message: 'Это тестовое уведомление для проверки отображения system_alert',
      type: 'system_alert',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    })

    logDebug('Notification sending result:', result)
    logDebug('Success:', result.some(r => r === true))

    // Получаем список уведомлений пользователя
    const notifications = await notificationService.getNotificationsForUser(TEST_USER_ID, 5, 1)
    logDebug(`First 5 notifications for user ${TEST_USER_ID}:`, notifications?.docs.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }))
    )

    logDebug('Test completed successfully.')
    process.exit(0)
  } catch (error) {
    logError('Error running test-notification script:', error)
    process.exit(1)
  }
}

main() 