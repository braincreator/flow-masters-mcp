import { fetchFromAPI } from './api'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Получает лидерборд
 * @param limit Максимальное количество записей
 * @param page Номер страницы
 */
export async function getLeaderboard(limit: number = 10, page: number = 1) {
  try {
    const response = await fetchFromAPI(`/api/leaderboard?limit=${limit}&page=${page}`)
    return response
  } catch (error) {
    logError('Error getting leaderboard:', error)
    throw error
  }
}

/**
 * Получает позицию пользователя в лидерборде
 * @param userId ID пользователя
 */
export async function getUserRank(userId: string) {
  try {
    const response = await fetchFromAPI(`/api/leaderboard/user/${userId}`)
    return response
  } catch (error) {
    logError('Error getting user rank:', error)
    throw error
  }
}

/**
 * Получает топ пользователей
 * @param limit Максимальное количество записей
 */
export async function getTopUsers(limit: number = 5) {
  try {
    const response = await fetchFromAPI(`/api/leaderboard/top?limit=${limit}`)
    return response
  } catch (error) {
    logError('Error getting top users:', error)
    throw error
  }
}
