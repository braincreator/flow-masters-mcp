import { fetchFromAPI } from './api'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Получает информацию о пользователе
 * @param userId ID пользователя
 */
export async function getUser(userId: string) {
  try {
    const response = await fetchFromAPI(`/api/users/${userId}`)
    return response
  } catch (error) {
    logError('Error getting user:', error)
    throw error
  }
}

/**
 * Получает информацию о уровне пользователя
 * @param userId ID пользователя
 */
export async function getUserLevelInfo(userId: string) {
  try {
    const response = await fetchFromAPI(`/api/users/${userId}/level`)
    return response
  } catch (error) {
    logError('Error getting user level info:', error)
    throw error
  }
}

/**
 * Получает все уровни
 */
export async function getAllLevels() {
  try {
    const response = await fetchFromAPI('/api/levels')
    return response
  } catch (error) {
    logError('Error getting levels:', error)
    throw error
  }
}

/**
 * Обновляет профиль пользователя
 * @param userId ID пользователя
 * @param data Данные для обновления
 */
export async function updateUserProfile(userId: string, data: any) {
  try {
    const response = await fetchFromAPI(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return response
  } catch (error) {
    logError('Error updating user profile:', error)
    throw error
  }
}
