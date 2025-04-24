import { fetchFromAPI } from './api'

/**
 * Получает достижения пользователя
 * @param userId ID пользователя
 */
export async function fetchUserAchievements(userId: string) {
  try {
    const response = await fetchFromAPI(`/api/achievements/user/${userId}`)
    return response
  } catch (error) {
    console.error('Error fetching user achievements:', error)
    throw error
  }
}

/**
 * Получает все доступные достижения
 */
export async function fetchAllAchievements() {
  try {
    const response = await fetchFromAPI('/api/achievements')
    return response
  } catch (error) {
    console.error('Error fetching achievements:', error)
    throw error
  }
}
