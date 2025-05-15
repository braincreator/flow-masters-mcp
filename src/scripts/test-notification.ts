import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

async function main() {
  try {
    console.log('Initializing PayloadCMS...')
    const payload = await getPayloadClient()
    console.log('PayloadCMS initialized successfully.')

    // Инициализируем сервисы
    console.log('Initializing ServiceRegistry...')
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const notificationService = serviceRegistry.getNotificationService()
    console.log('NotificationService initialized successfully.')

    // ID пользователя для тестирования (должен существовать)
    const TEST_USER_ID = '682521f596cf2ec3dca56c13'

    // Создаем тестовое уведомление
    console.log(`Creating test notification for user ${TEST_USER_ID}...`)
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

    console.log('Notification sending result:', result)
    console.log('Success:', result.some(r => r === true))

    // Получаем список уведомлений пользователя
    const notifications = await notificationService.getNotificationsForUser(TEST_USER_ID, 5, 1)
    console.log(`First 5 notifications for user ${TEST_USER_ID}:`, 
      notifications?.docs.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }))
    )

    console.log('Test completed successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Error running test-notification script:', error)
    process.exit(1)
  }
}

main() 