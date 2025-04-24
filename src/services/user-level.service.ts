import { Payload } from 'payload'
import { BaseService } from './base.service'

// Конфигурация уровней
// Каждый уровень требует определенное количество XP
// Формула: level N требует BASE_XP * (LEVEL_MULTIPLIER ^ (N-1)) XP
const LEVEL_CONFIG = {
  BASE_XP: 100, // Базовое количество XP для уровня 1
  LEVEL_MULTIPLIER: 1.5, // Множитель для каждого следующего уровня
  MAX_LEVEL: 50, // Максимальный уровень
}

export class UserLevelService extends BaseService {
  private static instance: UserLevelService | null = null
  private levelThresholds: number[] = []

  private constructor(payload: Payload) {
    super(payload)
    this.initLevelThresholds()
  }

  public static getInstance(payload: Payload): UserLevelService {
    if (!UserLevelService.instance) {
      UserLevelService.instance = new UserLevelService(payload)
    }
    return UserLevelService.instance
  }

  /**
   * Инициализирует пороговые значения XP для каждого уровня
   */
  private initLevelThresholds(): void {
    this.levelThresholds = [0] // Уровень 0 (не используется)

    let totalXp = 0
    for (let level = 1; level <= LEVEL_CONFIG.MAX_LEVEL; level++) {
      const xpForLevel = Math.round(
        LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.LEVEL_MULTIPLIER, level - 1),
      )
      totalXp += xpForLevel
      this.levelThresholds.push(totalXp)
    }
  }

  /**
   * Вычисляет уровень пользователя на основе его XP
   * @param xp Количество XP пользователя
   * @returns Уровень пользователя
   */
  calculateLevel(xp: number): number {
    if (xp <= 0) return 1

    // Находим наибольший уровень, для которого XP пользователя >= порогового значения
    for (let level = LEVEL_CONFIG.MAX_LEVEL; level >= 1; level--) {
      if (xp >= this.levelThresholds[level - 1]) {
        return level
      }
    }

    return 1
  }

  /**
   * Вычисляет прогресс до следующего уровня в процентах
   * @param xp Количество XP пользователя
   * @returns Прогресс до следующего уровня (0-100)
   */
  calculateLevelProgress(xp: number): number {
    const currentLevel = this.calculateLevel(xp)

    // Если достигнут максимальный уровень
    if (currentLevel >= LEVEL_CONFIG.MAX_LEVEL) {
      return 100
    }

    const currentLevelXP = this.levelThresholds[currentLevel - 1]
    const nextLevelXP = this.levelThresholds[currentLevel]
    const xpForNextLevel = nextLevelXP - currentLevelXP
    const xpProgress = xp - currentLevelXP

    return Math.min(100, Math.max(0, Math.round((xpProgress / xpForNextLevel) * 100)))
  }

  /**
   * Получает информацию о XP, необходимом для следующего уровня
   * @param xp Количество XP пользователя
   * @returns Объект с информацией о текущем уровне, XP до следующего уровня и т.д.
   */
  getLevelInfo(xp: number): {
    currentLevel: number
    currentXP: number
    nextLevelXP: number
    xpToNextLevel: number
    progress: number
    isMaxLevel: boolean
  } {
    const currentLevel = this.calculateLevel(xp)
    const isMaxLevel = currentLevel >= LEVEL_CONFIG.MAX_LEVEL

    const currentLevelXP = this.levelThresholds[currentLevel - 1]
    const nextLevelXP = isMaxLevel ? currentLevelXP : this.levelThresholds[currentLevel]
    const xpToNextLevel = isMaxLevel ? 0 : nextLevelXP - xp
    const progress = this.calculateLevelProgress(xp)

    return {
      currentLevel,
      currentXP: xp,
      nextLevelXP,
      xpToNextLevel,
      progress,
      isMaxLevel,
    }
  }

  /**
   * Обновляет уровень пользователя на основе его XP
   * @param userId ID пользователя
   * @returns Обновленный пользователь
   */
  async updateUserLevel(userId: string): Promise<any> {
    try {
      // Получаем текущего пользователя
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId,
      })

      const xp = user.xp || 0
      const currentLevel = this.calculateLevel(xp)

      // Если уровень не изменился, просто возвращаем пользователя
      if (user.level === currentLevel) {
        return user
      }

      // Обновляем уровень пользователя
      const updatedUser = await this.payload.update({
        collection: 'users',
        id: userId,
        data: {
          level: currentLevel,
        },
      })

      // Если уровень повысился, отправляем уведомление
      if (!user.level || currentLevel > user.level) {
        await this.sendLevelUpNotification(userId, currentLevel)

        // Проверяем и выдаем награды за уровень
        const serviceRegistry = this.payload.services
        if (serviceRegistry && serviceRegistry.getRewardService) {
          const rewardService = serviceRegistry.getRewardService()
          await rewardService.checkAndAwardLevelRewards(userId, currentLevel)
        }

        // Обновляем лидерборд
        if (serviceRegistry && serviceRegistry.getLeaderboardService) {
          const leaderboardService = serviceRegistry.getLeaderboardService()
          await leaderboardService.updateLeaderboard()
        }
      }

      return updatedUser
    } catch (error) {
      console.error('Error updating user level:', error)
      throw error
    }
  }

  /**
   * Отправляет уведомление о повышении уровня
   * @param userId ID пользователя
   * @param newLevel Новый уровень
   */
  private async sendLevelUpNotification(userId: string, newLevel: number): Promise<void> {
    try {
      const serviceRegistry = this.payload.services
      if (serviceRegistry && serviceRegistry.getNotificationService) {
        const notificationService = serviceRegistry.getNotificationService()

        await notificationService.sendNotification({
          userId,
          title: 'Новый уровень!',
          message: `Поздравляем! Вы достигли уровня ${newLevel}`,
          type: 'level_up',
          metadata: {
            level: newLevel,
          },
        })
      }
    } catch (error) {
      console.error('Error sending level up notification:', error)
    }
  }

  /**
   * Получает все уровни и их пороговые значения XP
   * @returns Массив объектов с информацией о уровнях
   */
  getAllLevels(): Array<{ level: number; xpRequired: number }> {
    const levels = []

    for (let level = 1; level <= LEVEL_CONFIG.MAX_LEVEL; level++) {
      levels.push({
        level,
        xpRequired: this.levelThresholds[level - 1],
      })
    }

    return levels
  }
}
