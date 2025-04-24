import { fetchFromAPI } from './api'

/**
 * Получает уведомления пользователя
 * @param limit Максимальное количество уведомлений
 */
export async function fetchNotifications(limit: number = 20) {
  try {
    const response = await fetchFromAPI(`/api/notifications?limit=${limit}`)
    return response
  } catch (error) {
    console.error('Error fetching notifications:', error)
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
    console.error('Error marking notification as read:', error)
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
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}
