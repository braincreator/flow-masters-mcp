import { Payload } from 'payload'
import { BaseService } from './base.service'
import { IntegrationService } from './integration.service'
import { UserLevelService } from './user-level.service'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Типы событий для достижений
export enum AchievementEventType {
  // Курсы
  COURSE_STARTED = 'course.started',
  COURSE_COMPLETED = 'course.completed',
  COURSE_PROGRESS = 'course.progress',
  LESSON_COMPLETED = 'lesson.completed',
  QUIZ_COMPLETED = 'quiz.completed',
  ASSIGNMENT_COMPLETED = 'assignment.completed',

  // Активность
  STREAK_ACHIEVED = 'streak.achieved',
  LOGIN_COUNT = 'login.count',
  PROFILE_COMPLETED = 'profile.completed',

  // Социальная активность
  COMMENT_ADDED = 'comment.added',
  CONTENT_SHARED = 'content.shared',
  REFERRAL_COMPLETED = 'referral.completed',
}

// Интерфейс для данных события достижения
export interface AchievementEventData {
  userId: string
  eventType: AchievementEventType | string
  courseId?: string
  lessonId?: string
  quizId?: string
  assignmentId?: string
  value?: number
  metadata?: Record<string, any>
}

export class AchievementService extends BaseService {
  private static instance: AchievementService | null = null
  private integrationService: IntegrationService | null = null
  private userLevelService: UserLevelService | null = null
  private leaderboardService: any = null
  private rewardService: any = null

  private constructor(payload: Payload) {
    super(payload)
    this.integrationService = IntegrationService.getInstance(payload)
    this.userLevelService = UserLevelService.getInstance(payload)

    // Используем require для избежания циклических зависимостей
    const serviceRegistry = payload.services
    if (serviceRegistry) {
      this.leaderboardService = serviceRegistry.getLeaderboardService()
      this.rewardService = serviceRegistry.getRewardService()
    }
  }

  public static getInstance(payload: Payload): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService(payload)
    }
    return AchievementService.instance
  }

  /**
   * Обрабатывает событие достижения
   * @param data Данные события
   */
  async processEvent(data: AchievementEventData): Promise<void> {
    try {
      logDebug(`Processing achievement event ${data.eventType}:`, data)

      // Находим все достижения, которые могут быть разблокированы этим событием
      const achievements = await this.payload.find({
        collection: 'achievements',
        where: {
          and: [
            {
              status: { equals: 'active' },
            },
            {
              triggerEvent: { equals: data.eventType },
            },
          ],
        },
      })

      if (achievements.docs.length === 0) {
        logDebug(`No achievements found for event ${data.eventType}`)
        return
      }

      // Проверяем каждое достижение
      for (const achievement of achievements.docs) {
        await this.checkAndAwardAchievement(achievement, data)
      }

      // Отправляем событие в систему интеграций для дополнительной обработки
      if (this.integrationService) {
        await this.integrationService.processEvent(data.eventType, data)
      }
    } catch (error) {
      logError(`Error processing achievement event:`, error)
    }
  }

  /**
   * Проверяет условия достижения и награждает пользователя, если условия выполнены
   * @param achievement Достижение для проверки
   * @param data Данные события
   */
  private async checkAndAwardAchievement(
    achievement: any,
    data: AchievementEventData,
  ): Promise<void> {
    try {
      // Проверяем, не получил ли пользователь уже это достижение
      const existingUserAchievements = await this.payload.find({
        collection: 'user-achievements',
        where: {
          and: [
            {
              user: { equals: data.userId },
            },
            {
              achievement: { equals: achievement.id },
            },
          ],
        },
      })

      if (existingUserAchievements.docs.length > 0) {
        logDebug(`User ${data.userId} already has achievement ${achievement.title}`)
        return
      }

      // Проверяем условия достижения
      let conditionsMet = true

      // Проверка условий на основе типа достижения
      switch (achievement.triggerEvent) {
        case AchievementEventType.COURSE_COMPLETED:
          // Проверяем, соответствует ли курс
          if (achievement.courseId && achievement.courseId !== data.courseId) {
            conditionsMet = false
          }
          break

        case AchievementEventType.COURSE_PROGRESS:
          // Проверяем, достигнут ли необходимый прогресс
          if (
            achievement.requiredValue &&
            (!data.value || data.value < achievement.requiredValue)
          ) {
            conditionsMet = false
          }
          break

        case AchievementEventType.STREAK_ACHIEVED:
          // Проверяем, достигнута ли необходимая серия
          if (
            achievement.requiredValue &&
            (!data.value || data.value < achievement.requiredValue)
          ) {
            conditionsMet = false
          }
          break

        case AchievementEventType.LOGIN_COUNT:
          // Проверяем количество входов
          if (
            achievement.requiredValue &&
            (!data.value || data.value < achievement.requiredValue)
          ) {
            conditionsMet = false
          }
          break

        // Добавьте другие типы событий по мере необходимости
      }

      // Если условия выполнены, награждаем пользователя достижением
      if (conditionsMet) {
        await this.awardAchievement(data.userId, achievement)
      }
    } catch (error) {
      logError(`Error checking achievement ${achievement.title}:`, error)
    }
  }

  /**
   * Награждает пользователя достижением
   * @param userId ID пользователя
   * @param achievement Достижение
   */
  private async awardAchievement(userId: string, achievement: any): Promise<void> {
    try {
      logDebug(`Awarding achievement ${achievement.title} to user ${userId}`)

      // Создаем запись о достижении пользователя
      const userAchievement = await this.payload.create({
        collection: 'user-achievements',
        data: {
          user: userId,
          achievement: achievement.id,
          awardedAt: new Date().toISOString(),
          status: 'active',
        },
      })

      logDebug(`Achievement awarded: ${userAchievement.id}`)

      // Обновляем счетчик XP пользователя, если достижение дает XP
      if (achievement.xpValue && achievement.xpValue > 0) {
        await this.updateUserXP(userId, achievement.xpValue)
      }

      // Отправляем уведомление пользователю
      await this.sendAchievementNotification(userId, achievement)

      // Проверяем и выдаем награды за достижение
      if (this.rewardService) {
        await this.rewardService.checkAndAwardAchievementRewards(userId, achievement.id)
      }

      // Обновляем лидерборд
      if (this.leaderboardService) {
        await this.leaderboardService.updateLeaderboard()
      }
    } catch (error) {
      logError(`Error awarding achievement:`, error)
    }
  }

  /**
   * Обновляет количество XP пользователя и его уровень
   * @param userId ID пользователя
   * @param xpToAdd Количество XP для добавления
   */
  private async updateUserXP(userId: string, xpToAdd: number): Promise<void> {
    try {
      // Получаем текущего пользователя
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId,
      })

      // Обновляем XP
      const currentXP = user.xp || 0
      const newXP = currentXP + xpToAdd

      // Обновляем пользователя
      await this.payload.update({
        collection: 'users',
        id: userId,
        data: {
          xp: newXP,
        },
      })

      logDebug(`Updated user ${userId} XP: ${currentXP} -> ${newXP}`)

      // Обновляем уровень пользователя
      if (this.userLevelService) {
        await this.userLevelService.updateUserLevel(userId)
      }
    } catch (error) {
      logError(`Error updating user XP:`, error)
    }
  }

  /**
   * Отправляет уведомление пользователю о полученном достижении
   * @param userId ID пользователя
   * @param achievement Достижение
   */
  private async sendAchievementNotification(userId: string, achievement: any): Promise<void> {
    try {
      // Проверяем, есть ли сервис уведомлений
      const serviceRegistry = this.payload.services
      if (serviceRegistry && serviceRegistry.getNotificationService) {
        const notificationService = serviceRegistry.getNotificationService()

        // Отправляем уведомление
        await notificationService.sendNotification({
          userId,
          title: 'Новое достижение!',
          message: `Вы получили достижение "${achievement.title}"`,
          type: 'achievement',
          metadata: {
            achievementId: achievement.id,
            achievementTitle: achievement.title,
            achievementDescription: achievement.description,
            achievementIcon: achievement.icon,
          },
        })
      }
    } catch (error) {
      logError(`Error sending achievement notification:`, error)
    }
  }

  /**
   * Получает все достижения пользователя
   * @param userId ID пользователя
   */
  async getUserAchievements(userId: string): Promise<any[]> {
    try {
      const userAchievements = await this.payload.find({
        collection: 'user-achievements',
        where: {
          user: {
            equals: userId,
          },
        },
        depth: 1, // Включаем данные о достижениях
      })

      return userAchievements.docs
    } catch (error) {
      logError(`Error getting user achievements:`, error)
      return []
    }
  }

  /**
   * Получает прогресс пользователя по всем достижениям
   * @param userId ID пользователя
   */
  async getUserAchievementProgress(userId: string): Promise<any> {
    try {
      // Получаем все достижения
      const allAchievements = await this.payload.find({
        collection: 'achievements',
        where: {
          status: {
            equals: 'active',
          },
        },
      })

      // Получаем достижения пользователя
      const userAchievements = await this.getUserAchievements(userId)

      // Создаем карту полученных достижений для быстрого поиска
      const userAchievementMap = new Map()
      userAchievements.forEach((ua) => {
        if (typeof ua.achievement === 'object' && ua.achievement !== null) {
          userAchievementMap.set(ua.achievement.id, ua)
        } else {
          userAchievementMap.set(ua.achievement, ua)
        }
      })

      // Вычисляем прогресс
      const totalAchievements = allAchievements.docs.length
      const earnedAchievements = userAchievements.length
      const progressPercentage =
        totalAchievements > 0 ? Math.round((earnedAchievements / totalAchievements) * 100) : 0

      // Группируем достижения по категориям
      const achievementsByCategory = {}

      allAchievements.docs.forEach((achievement) => {
        const category = achievement.category || 'Другое'

        if (!achievementsByCategory[category]) {
          achievementsByCategory[category] = {
            total: 0,
            earned: 0,
            achievements: [],
          }
        }

        const isEarned = userAchievementMap.has(achievement.id)

        achievementsByCategory[category].total++
        if (isEarned) achievementsByCategory[category].earned++

        achievementsByCategory[category].achievements.push({
          ...achievement,
          isEarned,
          earnedAt: isEarned ? userAchievementMap.get(achievement.id).awardedAt : null,
        })
      })

      return {
        totalAchievements,
        earnedAchievements,
        progressPercentage,
        categories: achievementsByCategory,
      }
    } catch (error) {
      logError(`Error getting user achievement progress:`, error)
      return {
        totalAchievements: 0,
        earnedAchievements: 0,
        progressPercentage: 0,
        categories: {},
      }
    }
  }
}
