import { fetchFromAPI } from './api'

/**
 * Получает награды пользователя
 * @param userId ID пользователя
 */
export async function getUserRewards(userId: string) {
  try {
    const response = await fetchFromAPI(`/api/rewards/user/${userId}`)
    return response
  } catch (error) {
    console.error('Error getting user rewards:', error)
    throw error
  }
}

/**
 * Получает активные награды пользователя
 * @param userId ID пользователя
 */
export async function getActiveUserRewards(userId: string) {
  try {
    const response = await fetchFromAPI(`/api/rewards/user/${userId}/active`)
    return response
  } catch (error) {
    console.error('Error getting active user rewards:', error)
    throw error
  }
}

/**
 * Использует награду
 * @param rewardId ID награды пользователя
 */
export async function useReward(rewardId: string) {
  try {
    const response = await fetchFromAPI(`/api/rewards/use/${rewardId}`, {
      method: 'POST',
    })
    return response
  } catch (error) {
    console.error('Error using reward:', error)
    throw error
  }
}

/**
 * Активирует скидку из награды
 * @param rewardId ID награды пользователя
 */
export async function activateDiscountFromReward(rewardId: string) {
  try {
    const response = await fetchFromAPI(`/api/rewards/use/discount/${rewardId}`, {
      method: 'POST',
    })
    return response
  } catch (error) {
    console.error('Error activating discount from reward:', error)
    throw error
  }
}

/**
 * Получает доступные скидки пользователя
 */
export async function getUserDiscounts() {
  try {
    const response = await fetchFromAPI('/api/user/discounts')
    return response
  } catch (error) {
    console.error('Error getting user discounts:', error)
    throw error
  }
}
