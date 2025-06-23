import { fetchFromAPI } from './api'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Получает достижения пользователя
 * @param userId ID пользователя
 */
export async function fetchUserAchievements(userId: string) {
  try {
    const response = await fetchFromAPI(`/api/achievements/user/${userId}`)
    return response
  } catch (error) {
    logError('Error fetching user achievements:', error)
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
    logError('Error fetching achievements:', error)
    throw error
  }
}
