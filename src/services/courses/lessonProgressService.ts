import { Payload } from 'payload'
import { BaseService } from '../base.service'

export class LessonProgressService extends BaseService {
  private static instance: LessonProgressService | null = null

  private constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): LessonProgressService {
    if (!LessonProgressService.instance) {
      LessonProgressService.instance = new LessonProgressService(payload)
    }
    return LessonProgressService.instance
  }

  /**
   * Отмечает урок как просмотренный
   * @param userId ID пользователя
   * @param lessonId ID урока
   * @param courseId ID курса
   */
  async markLessonAsViewed(userId: string, lessonId: string, courseId: string): Promise<any> {
    try {
      // Проверяем, есть ли уже запись о прогрессе
      const existingProgress = await this.payload.find({
        collection: 'lesson-progress',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              lesson: {
                equals: lessonId,
              },
            },
          ],
        },
      })

      // Если запись уже существует, обновляем её
      if (existingProgress.docs.length > 0) {
        const progress = existingProgress.docs[0]
        
        // Если урок уже отмечен как просмотренный, просто возвращаем запись
        if (progress.status === 'completed') {
          return progress
        }
        
        // Обновляем статус
        return await this.payload.update({
          collection: 'lesson-progress',
          id: progress.id,
          data: {
            status: 'completed',
            completedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
          },
        })
      }

      // Создаем новую запись о прогрессе
      const newProgress = await this.payload.create({
        collection: 'lesson-progress',
        data: {
          user: userId,
          lesson: lessonId,
          course: courseId,
          status: 'completed',
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
        },
      })

      // Отслеживаем событие в системе достижений
      try {
        const serviceRegistry = this.payload.services
        if (serviceRegistry) {
          const achievementService = serviceRegistry.getAchievementService()
          await achievementService.processEvent({
            userId,
            lessonId,
            courseId,
            eventType: 'lesson.completed',
          })
        }
      } catch (error) {
        console.error('Error tracking lesson completion event:', error)
      }

      // Обновляем общий прогресс по курсу
      await this.updateCourseProgress(userId, courseId)

      return newProgress
    } catch (error) {
      console.error('Error marking lesson as viewed:', error)
      throw error
    }
  }

  /**
   * Получает прогресс пользователя по уроку
   * @param userId ID пользователя
   * @param lessonId ID урока
   */
  async getLessonProgress(userId: string, lessonId: string): Promise<any> {
    try {
      const progress = await this.payload.find({
        collection: 'lesson-progress',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              lesson: {
                equals: lessonId,
              },
            },
          ],
        },
      })

      return progress.docs.length > 0 ? progress.docs[0] : null
    } catch (error) {
      console.error('Error getting lesson progress:', error)
      return null
    }
  }

  /**
   * Получает все просмотренные уроки пользователя в курсе
   * @param userId ID пользователя
   * @param courseId ID курса
   */
  async getCompletedLessonsInCourse(userId: string, courseId: string): Promise<string[]> {
    try {
      const progress = await this.payload.find({
        collection: 'lesson-progress',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              course: {
                equals: courseId,
              },
            },
            {
              status: {
                equals: 'completed',
              },
            },
          ],
        },
      })

      return progress.docs.map((p) => p.lesson)
    } catch (error) {
      console.error('Error getting completed lessons:', error)
      return []
    }
  }

  /**
   * Обновляет общий прогресс по курсу на основе просмотренных уроков
   * @param userId ID пользователя
   * @param courseId ID курса
   */
  async updateCourseProgress(userId: string, courseId: string): Promise<void> {
    try {
      // Получаем все уроки курса
      const lessons = await this.payload.find({
        collection: 'lessons',
        where: {
          course: {
            equals: courseId,
          },
        },
      })

      // Получаем все просмотренные уроки пользователя в курсе
      const completedLessons = await this.getCompletedLessonsInCourse(userId, courseId)

      // Вычисляем процент прогресса
      const totalLessons = lessons.docs.length
      const completedCount = completedLessons.length
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      // Обновляем прогресс в записи о зачислении на курс
      const serviceRegistry = this.payload.services
      if (serviceRegistry) {
        const enrollmentService = serviceRegistry.getEnrollmentService()
        await enrollmentService.updateCourseProgress(userId, courseId, progressPercentage)
      }
    } catch (error) {
      console.error('Error updating course progress:', error)
    }
  }
}
