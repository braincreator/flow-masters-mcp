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
        // Explicitly type the data object
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
              date: new Date().toISOString().split('T')[0] as string, // Assert as string
              views: 0,
              enrollments: 0,
              completions: 0,
              revenue: 0,
            },
          ],
        } satisfies Partial<CourseAnalyticsData>, // Ensure it satisfies the type
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
      // Fetch only necessary fields initially if possible, or prepare for granular updates
      const analyticsDoc = await this.getOrCreateAnalytics(event.courseId)
      const analyticsId = analyticsDoc.id

      // Prepare update payload
      const updateData: Partial<CourseAnalyticsData> = {}
      const incData: { [key: string]: number } = {}

      // --- Handle Time Distribution ---
      const today = new Date().toISOString().split('T')[0]; // Define today once here
      // Use let for index as it might be reassigned if a new day is added
      let todayDistributionIndex = analyticsDoc.timeDistribution?.findIndex(
        (item: any) => item.date === today,
      ) ?? -1;

      // If today's distribution doesn't exist, we need to add it.
      // This requires fetching the doc or handling it carefully.
      // --- Prepare updates ---
      // Note: Complex updates (rates, array elements) might still require fetching the full doc
      // This optimization focuses on simple increments first.

      // --- Update based on event type ---
      switch (event.eventType) {
        case 'view':
          incData['views'] = 1
          // Time distribution update requires fetch or complex operators, handled later if needed
          break

        case 'enrollment':
          incData['enrollments'] = 1
          // Time distribution update requires fetch or complex operators, handled later if needed
          // Recalculating rates requires fetching the latest counts, handled later if needed
          break

        case 'start':
          // This mainly affects conversion rates, which require fetching current values
          // updateData['conversionRates.enrollmentToStart'] = ... calculate ...
          break

        case 'completion':
          incData['completions'] = 1
          // Time distribution update requires fetch or complex operators, handled later if needed
          // Recalculating rates requires fetching the latest counts, handled later if needed
          break

        case 'module_completion':
          // Updating arrays often requires fetching the document or using complex positional operators
          // Array updates are complex to optimize with $inc, fetch full doc for these cases
          const moduleAnalyticsFull = await this.getOrCreateAnalytics(event.courseId) // Re-fetch full doc
          if (event.moduleId) {
            let moduleStats = moduleAnalyticsFull.moduleCompletionRates?.find(
              (item: any) => item.moduleId === event.moduleId,
            )
            if (!moduleStats) {
              const fetchedModuleData = await this.payload.findByID({ collection: 'modules', id: event.moduleId }) // Renamed variable again
              if (fetchedModuleData) {
                if (!moduleAnalyticsFull.moduleCompletionRates) moduleAnalyticsFull.moduleCompletionRates = []
                moduleAnalyticsFull.moduleCompletionRates.push({ moduleId: event.moduleId, moduleTitle: fetchedModuleData.title, completionRate: 0 })
                moduleStats = moduleAnalyticsFull.moduleCompletionRates[moduleAnalyticsFull.moduleCompletionRates.length - 1]
              }
            }
            if (moduleStats && event.value !== undefined) {
              moduleStats.completionRate = event.value // Update in-memory object
            }
          }
          updateData['moduleCompletionRates'] = moduleAnalyticsFull.moduleCompletionRates // Assign potentially modified array
          break

        case 'lesson_completion':
          // Array updates are complex, fetch full doc
          const lessonAnalyticsFull = await this.getOrCreateAnalytics(event.courseId) // Re-fetch full doc
          if (event.lessonId && event.moduleId) {
            let lessonStats = lessonAnalyticsFull.lessonCompletionRates?.find(
              (item: any) => item.lessonId === event.lessonId,
            )
            if (!lessonStats) {
              const lesson = await this.payload.findByID({ collection: 'lessons', id: event.lessonId })
              const fetchedModuleData = await this.payload.findByID({ collection: 'modules', id: event.moduleId }) // Renamed variable again
              if (lesson && fetchedModuleData) {
                if (!lessonAnalyticsFull.lessonCompletionRates) lessonAnalyticsFull.lessonCompletionRates = []
                lessonAnalyticsFull.lessonCompletionRates.push({ lessonId: event.lessonId, lessonTitle: lesson.title, moduleTitle: fetchedModuleData.title, completionRate: 0, averageTimeSpent: 0 })
                lessonStats = lessonAnalyticsFull.lessonCompletionRates[lessonAnalyticsFull.lessonCompletionRates.length - 1]
              }
            }
            if (lessonStats) {
              if (event.value !== undefined) lessonStats.completionRate = event.value // Update in-memory
              if (event.timeSpent !== undefined) {
                 // Calculate average time spent (requires completion count)
                 const currentCompletions = lessonAnalyticsFull.completions + (incData['completions'] || 0); // Use potentially incremented value
                 const currentTotalTime = lessonStats.averageTimeSpent * (currentCompletions > 0 ? currentCompletions -1 : 0); // Estimate previous total
                 const newTotalTime = currentTotalTime + (event.timeSpent / 60); // Add new time in minutes
                 lessonStats.averageTimeSpent = currentCompletions > 0 ? newTotalTime / currentCompletions : (event.timeSpent / 60); // Calculate new average
              }
            }
          }
          updateData['lessonCompletionRates'] = lessonAnalyticsFull.lessonCompletionRates // Assign potentially modified array
          break

        case 'rating':
          // Average rating requires fetching current values for accurate calculation
          const ratingAnalyticsFull = await this.getOrCreateAnalytics(event.courseId) // Re-fetch full doc
          if (event.value !== undefined) {
            const currentCompletions = ratingAnalyticsFull.completions + (incData['completions'] || 0); // Use potentially incremented value
            const currentTotalRating = ratingAnalyticsFull.averageRating * (currentCompletions > 0 ? currentCompletions -1 : 0); // Estimate previous total
            const newTotalRating = currentTotalRating + event.value;
            updateData['averageRating'] = currentCompletions > 0 ? newTotalRating / currentCompletions : event.value;
          }
          break

        case 'purchase':
          if (event.value !== undefined) {
            incData['totalRevenue'] = event.value
            // Time distribution update requires fetch or complex operators, handled later if needed
          }
          break
      }

      // --- Handle Time Distribution Separately (Requires Fetch) ---
      // Find or add today's distribution record
      const distributionAnalytics = await this.getOrCreateAnalytics(event.courseId); // Fetch fresh doc for distribution
      // 'today' is defined above
      let needsDistributionUpdate = false;
      // Use let for index as it might be reassigned if a new day is added
      let todayDistIndex = distributionAnalytics.timeDistribution?.findIndex((d: any) => d.date === today) ?? -1;

      if (todayDistIndex === -1) {
          // Add today's record if it doesn't exist
          if (!distributionAnalytics.timeDistribution) distributionAnalytics.timeDistribution = [];
          distributionAnalytics.timeDistribution.push({
              date: today,
              views: 0,
              enrollments: 0,
              completions: 0,
              revenue: 0,
          });
          todayDistIndex = distributionAnalytics.timeDistribution.length - 1;
          needsDistributionUpdate = true; // Need to save the new array structure
      }

      // Apply increments to the correct day's distribution record (in memory)
      const distInc: { [key: string]: number } = {};
      if (event.eventType === 'view') distInc[`timeDistribution.${todayDistIndex}.views`] = 1;
      if (event.eventType === 'enrollment') distInc[`timeDistribution.${todayDistIndex}.enrollments`] = 1;
      if (event.eventType === 'completion') distInc[`timeDistribution.${todayDistIndex}.completions`] = 1;
      if (event.eventType === 'purchase' && event.value !== undefined) distInc[`timeDistribution.${todayDistIndex}.revenue`] = event.value;

      // Merge increments
      Object.assign(incData, distInc);

      // Prepare final update payload
      const finalUpdateData: any = { ...updateData }; // Use any to allow $inc
      if (needsDistributionUpdate) {
          // If we added a new day, we must save the whole array
          finalUpdateData['timeDistribution'] = distributionAnalytics.timeDistribution;
      }
      if (Object.keys(incData).length > 0) {
          finalUpdateData['$inc'] = incData;
      }


      // Perform the update only if there's something to update
      if (Object.keys(finalUpdateData).length > 0) {
        await this.payload.update({
          collection: 'course-analytics',
          id: analyticsId,
          data: finalUpdateData,
        });
      } else {
        console.log('No analytics updates needed for event:', event.eventType);
      }
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
