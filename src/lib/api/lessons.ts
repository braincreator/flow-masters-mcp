import { fetchFromAPI } from './api'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Отмечает урок как просмотренный
 * @param lessonId ID урока
 * @param courseId ID курса
 */
export async function markLessonAsViewed(lessonId: string, courseId: string) {
  try {
    const response = await fetchFromAPI(`/api/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    })
    return response
  } catch (error) {
    logError('Error marking lesson as viewed:', error)
    throw error
  }
}

/**
 * Получает статус прогресса по уроку
 * @param lessonId ID урока
 */
export async function getLessonProgressStatus(lessonId: string) {
  try {
    const response = await fetchFromAPI(`/api/lessons/${lessonId}/progress/status`)
    return response
  } catch (error) {
    logError('Error getting lesson progress status:', error)
    throw error
  }
}

/**
 * Получает информацию об уроке
 * @param lessonId ID урока
 */
export async function getLesson(lessonId: string) {
  try {
    const response = await fetchFromAPI(`/api/lessons/${lessonId}`)
    return response
  } catch (error) {
    logError('Error getting lesson:', error)
    throw error
  }
}
