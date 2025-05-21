import { NotificationType } from '@/providers/NotificationsProvider'
import { NotificationStoredType } from '@/types/notifications' // Import the enum

/**
 * Карта соответствий между типами уведомлений в БД (NotificationStoredType) и типами для UI (NotificationType)
 */
const DB_TO_UI_TYPE_MAP: Record<NotificationStoredType, NotificationType> = {
  [NotificationStoredType.COURSE_ENROLLED]: 'info',
  [NotificationStoredType.LESSON_COMPLETED]: 'success',
  [NotificationStoredType.MODULE_COMPLETED]: 'success',
  [NotificationStoredType.ASSESSMENT_SUBMITTED]: 'info',
  [NotificationStoredType.ASSESSMENT_GRADED]: 'info',
  [NotificationStoredType.COURSE_COMPLETED]: 'success',
  [NotificationStoredType.CERTIFICATE_ISSUED]: 'achievement',
  [NotificationStoredType.ACHIEVEMENT_UNLOCKED]: 'achievement',
  [NotificationStoredType.LEVEL_UP]: 'achievement',
  [NotificationStoredType.SYSTEM_ALERT]: 'system', // For critical alerts
  [NotificationStoredType.GENERAL_INFO]: 'info', // For general announcements
  [NotificationStoredType.ORDER_UPDATE]: 'info', // General UI type for order updates
  [NotificationStoredType.SUBSCRIPTION_UPDATE]: 'info', // General UI type for subscription updates
  [NotificationStoredType.ACCOUNT_ACTIVITY]: 'info', // For profile changes, password updates etc.
  [NotificationStoredType.PROMOTIONAL]: 'info', // For marketing, special offers, newsletters
  [NotificationStoredType.SOCIAL_INTERACTION]: 'message', // For comments, replies, mentions
  [NotificationStoredType.PROJECT_STATUS_UPDATED]: 'info', // For project status updates
}

/**
 * Преобразует тип уведомления из БД (значение из NotificationStoredType) в тип для UI
 * @param dbType Тип уведомления из БД
 * @returns Тип уведомления для UI
 */
export function mapDbTypeToUiType(dbType: string): NotificationType {
  console.log(`mapDbTypeToUiType: Получен тип "${dbType}"`)

  if (!dbType) {
    console.warn('mapDbTypeToUiType: Получен пустой тип уведомления, используем info по умолчанию')
    return 'info'
  }

  const uiType = DB_TO_UI_TYPE_MAP[dbType as NotificationStoredType]

  if (!uiType) {
    console.warn(
      `mapDbTypeToUiType: Тип "${dbType}" не найден в карте соответствий, используем info по умолчанию`,
    )
    return 'info'
  }

  console.log(`mapDbTypeToUiType: Преобразован тип DB="${dbType}" -> UI="${uiType}"`)
  return uiType
}

/**
 * Получает иконку для типа уведомления по его типу в БД
 * @param dbType Тип уведомления из БД
 * @returns Тип иконки для отображения в UI
 */
export function getNotificationTypeByDbType(dbType: string): NotificationType {
  return mapDbTypeToUiType(dbType)
}
