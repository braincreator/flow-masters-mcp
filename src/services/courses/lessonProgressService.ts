import { Payload } from 'payload'
import { BaseService } from '../base.service'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import { ServiceRegistry } from '../service.registry' // Added import
import { Lesson, LessonProgress } from '@/payload-types' // Import types

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
   * Marks a lesson as completed based on its criteria, or updates access time.
   * @param userId User ID
   * @param lessonId Lesson ID
   * @param courseId Course ID (for context and progress update)
   * @param forceComplete Optional flag to bypass criteria check (e.g., admin action or assessment completion)
   */
  async markLessonCompleted(
    userId: string,
    lessonId: string,
    courseId: string,
    forceComplete: boolean = false,
  ): Promise<LessonProgress | null> { // Return type could be LessonProgress | null
    try {
      // 1. Fetch Lesson details to check completionCriteria
      const lesson: any = await this.payload.findByID({ // Using any temporarily
        collection: 'lessons',
        id: lessonId,
        depth: 0,
      })

      if (!lesson) {
        throw new Error(`Lesson with ID ${lessonId} not found.`)
      }

      // 2. Find existing progress record
      const existingProgress = await this.payload.find({
        collection: 'lesson-progress',
        where: {
          and: [
            { user: { equals: userId } },
            { lesson: { equals: lessonId } },
          ],
        },
        limit: 1,
      })

      let progressRecord: LessonProgress | null = existingProgress.docs[0] ?? null // Use nullish coalescing directly

      // If already completed, just update lastAccessedAt and return
      if (progressRecord?.status === 'completed') {
        if (progressRecord.id) { // Ensure ID exists before update
           await this.payload.update({
            collection: 'lesson-progress',
            id: progressRecord.id,
            data: { lastAccessedAt: new Date().toISOString() },
          })
        }
        return progressRecord
      }

      // 3. Determine if completion should happen now
      // Using any temporarily for lesson type
      const shouldComplete = forceComplete || lesson?.completionCriteria === 'viewed'

      // 4. Create or Update progress record
      if (progressRecord) {
        // Update existing record
        const updateData: Partial<LessonProgress> = {
          lastAccessedAt: new Date().toISOString(),
        }
        if (shouldComplete) {
          updateData.status = 'completed'
          updateData.completedAt = new Date().toISOString()
        }
        progressRecord = await this.payload.update({
          collection: 'lesson-progress',
          id: progressRecord.id,
          data: updateData,
        })
      } else {
        // Create new record - Ensure all required fields are present
        const createData: Omit<LessonProgress, 'id' | 'createdAt' | 'updatedAt' | 'sizes'> = { // Exclude generated fields
          user: userId,
          lesson: lessonId,
          course: courseId,
          status: shouldComplete ? 'completed' : 'in_progress',
          lastAccessedAt: new Date().toISOString(),
          completedAt: shouldComplete ? new Date().toISOString() : undefined, // Set completedAt only if completing
          // timeSpent and metadata can be added later if needed
        }
        progressRecord = await this.payload.create({
          collection: 'lesson-progress',
          data: createData as any, // Use 'as any' to bypass strict type check until regeneration
        })
      }

      // 5. Trigger events only if lesson is newly completed
      if (shouldComplete) {
        try {
          const serviceRegistry = ServiceRegistry.getInstance(this.payload)
          if (serviceRegistry) {
            // Trigger achievement event
            const achievementService = serviceRegistry.getAchievementService()
            await achievementService.processEvent({
              userId,
              lessonId,
              courseId,
              eventType: 'lesson_completed', // Use underscore
            })

            // Trigger notification
            const notificationService = serviceRegistry.getNotificationService()
            await notificationService.sendNotification({
              userId,
              type: 'lesson_completed',
              title: `Lesson Completed: ${lesson.title}`,
              message: `You've completed the lesson "${lesson.title}". Keep going!`,
              link: `/courses/${courseId}/learn/${lessonId}`, // Adjust link as needed
              metadata: { courseId, lessonId, lessonTitle: lesson.title },
            })

            // Check for Module Completion
            if (lesson.module) { // Ensure the lesson is part of a module
              const moduleId = typeof lesson.module === 'string' ? lesson.module : lesson.module.id;
              if (moduleId) {
                // Fetch all published lessons in this module
                const moduleLessons = await this.payload.find({
                  collection: 'lessons',
                  where: {
                    module: { equals: moduleId },
                    status: { equals: 'published' },
                  },
                  limit: 0, // Just need the count
                  depth: 0,
                });
                const totalModuleLessons = moduleLessons.totalDocs;

                if (totalModuleLessons > 0) {
                  // Fetch IDs of all lessons in the module
                  const moduleLessonIds = (await this.payload.find({
                    collection: 'lessons',
                    where: { module: { equals: moduleId }, status: { equals: 'published' } },
                    limit: totalModuleLessons,
                    depth: 0,
                  })).docs.map(l => l.id);

                  // Fetch all completed lesson progress for the user for lessons in this module
                  const completedModuleLessonsProgress = await this.payload.find({
                    collection: 'lesson-progress',
                    where: {
                      user: { equals: userId },
                      lesson: { in: moduleLessonIds }, // Check if lesson is in the module
                      status: { equals: 'completed' },
                    },
                    limit: 0, // Just need the count
                    depth: 0,
                  });
                  const completedModuleLessonsCount = completedModuleLessonsProgress.totalDocs;

                  // If all lessons in the module are complete
                  if (completedModuleLessonsCount >= totalModuleLessons) {
                    // Fetch module details for the notification title (renamed variable)
                    const moduleDoc = await this.payload.findByID({
                      collection: 'modules',
                      id: moduleId,
                      depth: 0,
                    });
                    const moduleTitle = moduleDoc?.title || 'the module'; // Use renamed variable

                    await notificationService.sendNotification({
                      userId,
                      type: 'module_completed',
                      title: `Module Completed: ${moduleTitle}`, // Use renamed variable
                      message: `Congratulations! You've completed all lessons in the module "${moduleTitle}".`, // Use renamed variable
                      link: `/courses/${courseId}`, // Link to the course page or next module?
                      metadata: { courseId, moduleId, moduleTitle }, // Use renamed variable
                    });

                    // Trigger module completion achievement
                    await achievementService.processEvent({
                      userId,
                      courseId,
                      moduleId,
                      eventType: 'module_completed',
                    });
                  }
                }
              }
            }

            // Update overall course progress (asynchronously, don't wait)
            this.updateCourseProgress(userId, courseId).catch((err) =>
              logError('Background course progress update failed:', err),
            )
          }
        } catch (eventError) {
          logError('Error processing lesson completion events:', eventError)
        }
      }

      return progressRecord
    } catch (error) {
      logError(`Error marking lesson ${lessonId} progress for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Gets progress for a specific lesson for a user.
   * @param userId User ID
   * @param lessonId Lesson ID
   */
  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    try {
      const progress = await this.payload.find({
        collection: 'lesson-progress',
        where: {
          and: [
            { user: { equals: userId } },
            { lesson: { equals: lessonId } },
          ],
        },
        limit: 1,
      })

      return progress.docs[0] ?? null // Use nullish coalescing directly
    } catch (error) {
      logError('Error getting lesson progress:', error)
      return null
    }
  }

  /**
   * Gets IDs of all completed lessons for a user in a specific course.
   * @param userId User ID
   * @param courseId Course ID
   */
  async getCompletedLessonsInCourse(userId: string, courseId: string): Promise<string[]> {
    try {
      const progress = await this.payload.find({
        collection: 'lesson-progress',
        where: {
          and: [
            { user: { equals: userId } },
            { course: { equals: courseId } },
            { status: { equals: 'completed' } },
          ],
        },
        limit: 10000, // High limit to get all
        depth: 0, // Only need lesson IDs
      })

      // Ensure only lesson IDs (strings) are returned, handle potential object relation
      return progress.docs.map((p) => {
         const lessonRef = p.lesson;
         return typeof lessonRef === 'string' ? lessonRef : lessonRef?.id;
      }).filter((id): id is string => !!id); // Filter out undefined/null IDs and ensure string array
    } catch (error) {
      logError('Error getting completed lessons:', error)
      return []
    }
  }

  /**
   * Triggers an update of the overall course progress in the EnrollmentService.
   * This method itself doesn't calculate progress anymore to avoid circular dependencies.
   * @param userId User ID
   * @param courseId Course ID
   */
  async updateCourseProgress(userId: string, courseId: string): Promise<void> {
    try {
      // Simply call the enrollment service to handle the progress update logic
      const serviceRegistry = ServiceRegistry.getInstance(this.payload)
      if (serviceRegistry) {
        const enrollmentService = serviceRegistry.getEnrollmentService()
        // Let enrollmentService recalculate progress based on the latest completed lesson count
        await enrollmentService.updateCourseProgress(userId, courseId)
      } else {
         logError('ServiceRegistry not available in LessonProgressService.updateCourseProgress')
      }
    } catch (error) {
      logError(`Error triggering course progress update for user ${userId}, course ${courseId}:`, error)
      // Don't re-throw, let the primary action (e.g., marking lesson complete) succeed
    }
  }

  // TODO: Add method `markLessonCompletedByAssessment(userId, assessmentSubmissionId)`
  // This method would be called after an assessment is successfully graded.
  // It should find the related lesson, check if completionCriteria is 'pass_assessment',
  // and if so, call markLessonCompleted(userId, lessonId, courseId, true) with forceComplete = true.
}
