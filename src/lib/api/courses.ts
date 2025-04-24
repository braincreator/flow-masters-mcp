import { fetchFromAPI } from './api'

/**
 * Получает информацию о курсе
 * @param courseId ID курса
 */
export async function getCourse(courseId: string) {
  try {
    const response = await fetchFromAPI(`/api/courses/${courseId}`)
    return response
  } catch (error) {
    console.error('Error getting course:', error)
    throw error
  }
}

/**
 * Получает прогресс пользователя по курсу
 * @param courseId ID курса
 */
export async function getCourseProgress(courseId: string) {
  try {
    const response = await fetchFromAPI(`/api/courses/${courseId}/progress`)
    return response
  } catch (error) {
    console.error('Error getting course progress:', error)
    throw error
  }
}

/**
 * Получает достижения, связанные с курсом
 * @param courseId ID курса
 */
export async function getCourseAchievements(courseId: string) {
  try {
    const response = await fetchFromAPI(`/api/courses/${courseId}/achievements`)
    return response
  } catch (error) {
    console.error('Error getting course achievements:', error)
    throw error
  }
}

/**
 * Записывает пользователя на курс
 * @param courseId ID курса
 */
export async function enrollInCourse(courseId: string) {
  try {
    const response = await fetchFromAPI(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
    })
    return response
  } catch (error) {
    console.error('Error enrolling in course:', error)
    throw error
  }
}
