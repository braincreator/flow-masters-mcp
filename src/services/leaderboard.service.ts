import { Payload } from 'payload'
import { BaseService } from './base.service'

export class LeaderboardService extends BaseService {
  private static instance: LeaderboardService | null = null

  private constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService(payload)
    }
    return LeaderboardService.instance
  }

  /**
   * Обновляет лидерборд
   */
  async updateLeaderboard(): Promise<void> {
    try {
      console.log('Updating leaderboard...')
      
      // Получаем всех пользователей с их XP и уровнем
      const users = await this.payload.find({
        collection: 'users',
        limit: 1000,
        sort: '-xp',
        where: {
          xp: {
            greater_than: 0,
          },
        },
      })
      
      // Получаем текущий лидерборд
      const currentLeaderboard = await this.payload.find({
        collection: 'leaderboard',
        limit: 1000,
      })
      
      // Создаем карту текущего лидерборда для быстрого поиска
      const leaderboardMap = new Map()
      currentLeaderboard.docs.forEach((entry) => {
        leaderboardMap.set(entry.user, {
          id: entry.id,
          rank: entry.rank,
          xp: entry.xp,
        })
      })
      
      // Обновляем лидерборд
      let rank = 1
      for (const user of users.docs) {
        const userId = user.id
        const userXp = user.xp || 0
        const userLevel = user.level || 1
        
        // Получаем количество достижений пользователя
        const userAchievements = await this.payload.find({
          collection: 'user-achievements',
          where: {
            user: {
              equals: userId,
            },
          },
        })
        
        // Получаем количество завершенных курсов пользователя
        const completedCourses = await this.payload.find({
          collection: 'course-enrollments',
          where: {
            and: [
              {
                user: {
                  equals: userId,
                },
              },
              {
                progress: {
                  equals: 100,
                },
              },
            ],
          },
        })
        
        // Проверяем, есть ли пользователь в текущем лидерборде
        const currentEntry = leaderboardMap.get(userId)
        
        if (currentEntry) {
          // Обновляем существующую запись
          await this.payload.update({
            collection: 'leaderboard',
            id: currentEntry.id,
            data: {
              xp: userXp,
              level: userLevel,
              previousRank: currentEntry.rank,
              rank,
              rankChange: currentEntry.rank - rank,
              achievements: userAchievements.totalDocs,
              coursesCompleted: completedCourses.totalDocs,
              lastActive: new Date().toISOString(),
            },
          })
        } else {
          // Создаем новую запись
          await this.payload.create({
            collection: 'leaderboard',
            data: {
              user: userId,
              xp: userXp,
              level: userLevel,
              rank,
              previousRank: 0,
              rankChange: 0,
              achievements: userAchievements.totalDocs,
              coursesCompleted: completedCourses.totalDocs,
              lastActive: new Date().toISOString(),
            },
          })
        }
        
        rank++
      }
      
      console.log('Leaderboard updated successfully')
    } catch (error) {
      console.error('Error updating leaderboard:', error)
      throw error
    }
  }

  /**
   * Получает лидерборд
   * @param limit Максимальное количество записей
   * @param page Номер страницы
   */
  async getLeaderboard(limit: number = 10, page: number = 1): Promise<any> {
    try {
      const leaderboard = await this.payload.find({
        collection: 'leaderboard',
        limit,
        page,
        sort: 'rank',
        depth: 1, // Включаем данные о пользователе
      })
      
      return leaderboard
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      throw error
    }
  }

  /**
   * Получает позицию пользователя в лидерборде
   * @param userId ID пользователя
   */
  async getUserRank(userId: string): Promise<any> {
    try {
      const userEntry = await this.payload.find({
        collection: 'leaderboard',
        where: {
          user: {
            equals: userId,
          },
        },
        depth: 1, // Включаем данные о пользователе
      })
      
      if (userEntry.docs.length === 0) {
        return null
      }
      
      // Получаем пользователей выше и ниже в рейтинге
      const userRank = userEntry.docs[0].rank
      
      const usersAbove = await this.payload.find({
        collection: 'leaderboard',
        where: {
          rank: {
            less_than: userRank,
          },
        },
        limit: 2,
        sort: '-rank',
        depth: 1,
      })
      
      const usersBelow = await this.payload.find({
        collection: 'leaderboard',
        where: {
          rank: {
            greater_than: userRank,
          },
        },
        limit: 2,
        sort: 'rank',
        depth: 1,
      })
      
      return {
        user: userEntry.docs[0],
        usersAbove: usersAbove.docs,
        usersBelow: usersBelow.docs,
      }
    } catch (error) {
      console.error('Error getting user rank:', error)
      throw error
    }
  }

  /**
   * Получает топ пользователей по XP
   * @param limit Максимальное количество записей
   */
  async getTopUsers(limit: number = 5): Promise<any> {
    try {
      const topUsers = await this.payload.find({
        collection: 'leaderboard',
        limit,
        sort: 'rank',
        depth: 1, // Включаем данные о пользователе
      })
      
      return topUsers.docs
    } catch (error) {
      console.error('Error getting top users:', error)
      throw error
    }
  }
}
