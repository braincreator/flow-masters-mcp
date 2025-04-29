import { Payload } from 'payload'
import { getPayloadClient } from '@/utilities/payload/index'

// Типы для аналитики курса
export interface CourseAnalyticsData {
  course: string // ID курса
  courseTitle: string
  views: number
  enrollments: number
  completions: number
  completionRate: number
  averageRating: number
  totalRevenue: number
  moduleCompletionRates?: {
    moduleId: string
    moduleTitle: string
    completionRate: number
  }[]
  lessonCompletionRates?: {
    lessonId: string
    lessonTitle: string
    moduleTitle: string
    completionRate: number
    averageTimeSpent: number
  }[]
  conversionRates?: {
    landingToEnrollment: number
    enrollmentToStart: number
    startToCompletion: number
  }
  timeDistribution?: {
    date: string
    views: number
    enrollments: number
    completions: number
    revenue: number
  }[]
}

// Типы для событий аналитики
export interface AnalyticsEvent {
  courseId: string
  userId?: string
  eventType:
    | 'view'
    | 'enrollment'
    | 'start'
    | 'completion'
    | 'module_completion'
    | 'lesson_completion'
    | 'rating'
    | 'purchase'
  moduleId?: string
  lessonId?: string
  value?: number // Для рейтинга или суммы покупки
  timeSpent?: number // Время, проведенное на уроке (в секундах)
}

export class CourseAnalyticsService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Получает или создает запись аналитики для курса
   */
  async getOrCreateAnalytics(courseId: string): Promise<any> {
    try {
      // Ищем существующую запись аналитики
      const existingAnalytics = await this.payload.find({
        collection: 'course-analytics',
        where: {
          course: {
            equals: courseId,
          },
        },
      })

      if (existingAnalytics.docs.length > 0) {
        return existingAnalytics.docs[0]
      }

      // Если запись не найдена, получаем информацию о курсе
      const course = await this.payload.findByID({
        collection: 'courses',
        id: courseId,
      })

      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`)
      }

      // Создаем новую запись аналитики
      const newAnalytics = await this.payload.create({
        collection: 'course-analytics',
        data: {
          course: courseId,
          courseTitle: course.title,
          views: 0,
          enrollments: 0,
          completions: 0,
          completionRate: 0,
          averageRating: 0,
          totalRevenue: 0,
          conversionRates: {
            landingToEnrollment: 0,
            enrollmentToStart: 0,
            startToCompletion: 0,
          },
          timeDistribution: [
            {
              date: new Date().toISOString().split('T')[0],
              views: 0,
              enrollments: 0,
              completions: 0,
              revenue: 0,
            },
          ],
        },
      })

      return newAnalytics
    } catch (error) {
      console.error('Error getting or creating course analytics:', error)
      throw error
    }
  }

  /**
   * Обрабатывает событие аналитики
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Получаем или создаем запись аналитики
      const analytics = await this.getOrCreateAnalytics(event.courseId)

      // Получаем текущую дату в формате YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0]

      // Находим или создаем запись для текущей даты
      let todayDistribution = analytics.timeDistribution.find((item: any) => item.date === today)

      if (!todayDistribution) {
        analytics.timeDistribution.push({
          date: today,
          views: 0,
          enrollments: 0,
          completions: 0,
          revenue: 0,
        })
        todayDistribution = analytics.timeDistribution[analytics.timeDistribution.length - 1]
      }

      // Обновляем аналитику в зависимости от типа события
      switch (event.eventType) {
        case 'view':
          analytics.views += 1
          todayDistribution.views += 1
          break

        case 'enrollment':
          analytics.enrollments += 1
          todayDistribution.enrollments += 1

          // Обновляем конверсию лендинг → запись
          if (analytics.views > 0) {
            analytics.conversionRates.landingToEnrollment =
              (analytics.enrollments / analytics.views) * 100
          }
          break

        case 'start':
          // Обновляем конверсию запись → начало
          if (analytics.enrollments > 0) {
            analytics.conversionRates.enrollmentToStart =
              (event.value || 1 / analytics.enrollments) * 100
          }
          break

        case 'completion':
          analytics.completions += 1
          todayDistribution.completions += 1

          // Обновляем процент завершения
          if (analytics.enrollments > 0) {
            analytics.completionRate = (analytics.completions / analytics.enrollments) * 100
          }

          // Обновляем конверсию начало → завершение
          if (analytics.conversionRates.enrollmentToStart > 0) {
            const startCount =
              (analytics.enrollments * analytics.conversionRates.enrollmentToStart) / 100
            if (startCount > 0) {
              analytics.conversionRates.startToCompletion =
                (analytics.completions / startCount) * 100
            }
          }
          break

        case 'module_completion':
          if (event.moduleId) {
            // Находим или создаем запись для модуля
            let moduleStats = analytics.moduleCompletionRates?.find(
              (item: any) => item.moduleId === event.moduleId,
            )

            if (!moduleStats && event.moduleId) {
              // Получаем информацию о модуле
              const module = await this.payload.findByID({
                collection: 'modules',
                id: event.moduleId,
              })

              if (module) {
                if (!analytics.moduleCompletionRates) {
                  analytics.moduleCompletionRates = []
                }

                analytics.moduleCompletionRates.push({
                  moduleId: event.moduleId,
                  moduleTitle: module.title,
                  completionRate: 0,
                })

                moduleStats =
                  analytics.moduleCompletionRates[analytics.moduleCompletionRates.length - 1]
              }
            }

            if (moduleStats && event.value !== undefined) {
              moduleStats.completionRate = event.value
            }
          }
          break

        case 'lesson_completion':
          if (event.lessonId && event.moduleId) {
            // Находим или создаем запись для урока
            let lessonStats = analytics.lessonCompletionRates?.find(
              (item: any) => item.lessonId === event.lessonId,
            )

            if (!lessonStats) {
              // Получаем информацию об уроке и модуле
              const lesson = await this.payload.findByID({
                collection: 'lessons',
                id: event.lessonId,
              })

              const module = await this.payload.findByID({
                collection: 'modules',
                id: event.moduleId,
              })

              if (lesson && module) {
                if (!analytics.lessonCompletionRates) {
                  analytics.lessonCompletionRates = []
                }

                analytics.lessonCompletionRates.push({
                  lessonId: event.lessonId,
                  lessonTitle: lesson.title,
                  moduleTitle: module.title,
                  completionRate: 0,
                  averageTimeSpent: 0,
                })

                lessonStats =
                  analytics.lessonCompletionRates[analytics.lessonCompletionRates.length - 1]
              }
            }

            if (lessonStats) {
              if (event.value !== undefined) {
                lessonStats.completionRate = event.value
              }

              if (event.timeSpent !== undefined) {
                // Обновляем среднее время, проведенное на уроке (в минутах)
                const currentTotal = lessonStats.averageTimeSpent * (event.value || 1)
                const newTotal = currentTotal + event.timeSpent / 60
                lessonStats.averageTimeSpent = newTotal / ((event.value || 1) + 1)
              }
            }
          }
          break

        case 'rating':
          if (event.value !== undefined) {
            // Обновляем средний рейтинг
            const currentTotal = analytics.averageRating * analytics.completions
            const newTotal = currentTotal + event.value
            analytics.averageRating =
              analytics.completions > 0 ? newTotal / analytics.completions : event.value
          }
          break

        case 'purchase':
          if (event.value !== undefined) {
            analytics.totalRevenue += event.value
            todayDistribution.revenue += event.value
          }
          break
      }

      // Сохраняем обновленную аналитику
      await this.payload.update({
        collection: 'course-analytics',
        id: analytics.id,
        data: analytics,
      })
    } catch (error) {
      console.error('Error tracking analytics event:', error)
      throw error
    }
  }

  /**
   * Получает аналитику для курса
   */
  async getCourseAnalytics(courseId: string): Promise<any> {
    try {
      const analytics = await this.getOrCreateAnalytics(courseId)
      return analytics
    } catch (error) {
      console.error('Error getting course analytics:', error)
      throw error
    }
  }

  /**
   * Получает аналитику для всех курсов
   */
  async getAllCoursesAnalytics(): Promise<any> {
    try {
      const analytics = await this.payload.find({
        collection: 'course-analytics',
        sort: '-views',
      })

      return analytics.docs
    } catch (error) {
      console.error('Error getting all courses analytics:', error)
      throw error
    }
  }
}

/**
 * Создает экземпляр сервиса аналитики курсов
 */
export async function getCourseAnalyticsService(): Promise<CourseAnalyticsService> {
  const payload = await getPayloadClient()
  return new CourseAnalyticsService(payload)
}
