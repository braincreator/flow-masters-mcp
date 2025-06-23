import { fetchFromAPI } from './api'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Получает уведомления пользователя
 * @param limit Максимальное количество уведомлений
 * @param page Номер страницы для пагинации
 * @param onlyUnread Флаг для получения только непрочитанных уведомлений
 */
export async function fetchNotifications(
  limit: number = 20,
  page?: number,
  onlyUnread?: boolean,
) {
  try {
    let apiUrl = `/api/notifications?limit=${limit}`
    if (page !== undefined) {
      apiUrl += `&page=${page}`
    }
    if (onlyUnread !== undefined) {
      apiUrl += `&onlyUnread=${onlyUnread}`
    }
    logDebug(`fetchNotifications: Запрос к API: ${apiUrl}`)

    const response = await fetchFromAPI(apiUrl)

    logDebug('fetchNotifications: Данные получены от API:', Array.isArray(response) ? `Массив из ${response.length} уведомлений` : response,
    )
    
    return response
  } catch (error) {
    logError('Error fetching notifications:', error)
    throw error
  }
}

/**
 * Отмечает уведомление как прочитанное
 * @param notificationId ID уведомления
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await fetchFromAPI(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    })
    return response
  } catch (error) {
    logError('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Отмечает все уведомления как прочитанные
 */
export async function markAllNotificationsAsRead() {
  try {
    const response = await fetchFromAPI('/api/notifications/read-all', {
      method: 'POST',
    })
    return response
  } catch (error) {
    logError('Error marking all notifications as read:', error)
    throw error
  }
}
