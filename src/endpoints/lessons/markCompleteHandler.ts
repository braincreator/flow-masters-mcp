import { PayloadRequest } from 'payload'
import { Response, NextFunction } from 'express'
import { ServiceRegistry } from '@/services/service.registry'
import { Lesson } from '@/payload-types' // Import Lesson type

export async function markCompleteHandler(req: PayloadRequest, res: Response, next: NextFunction): Promise<Response | void> {
  const { payload, user } = req
  const lessonId = (req as any).lessonId // Assuming lessonId is available directly on req

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' })
  }

  if (!lessonId) {
    return res.status(400).json({ message: 'Missing lessonId parameter.' })
  }

  try {
    // 1. Fetch the lesson to get its course context
    // Note: @ts-expect-error removed as unused
    const lesson: Lesson | null = await payload.findByID({
      collection: 'lessons',
      id: lessonId,
      depth: 1, // Need depth 1 to populate the 'module' field
    })

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' })
    }

    // Extract courseId from the populated module
    const moduleId = typeof lesson.module === 'string' ? lesson.module : lesson.module?.id
    if (!moduleId) {
       return res.status(500).json({ message: 'Lesson module information is missing.' })
    }
    // Note: @ts-expect-error removed as unused
    const moduleDoc = await payload.findByID({ collection: 'modules', id: moduleId, depth: 0 }) // Renamed variable
    const courseId = typeof moduleDoc?.course === 'string' ? moduleDoc.course : moduleDoc?.course?.id

    if (!courseId) {
        return res.status(500).json({ message: 'Could not determine course for the lesson.' })
    }


    // 2. Check if the user has access to this course
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const enrollmentService = serviceRegistry.getEnrollmentService()
    const hasAccess = await enrollmentService.hasAccessToCourse(user.id, courseId)

    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden. You do not have access to this course.' })
    }

    // 3. Mark the lesson as completed using LessonProgressService
    const lessonProgressService = serviceRegistry.getLessonProgressService()
    // Note: We only call this for user-initiated completion.
    // Assessment-based completion should call this with forceComplete=true from assessment logic.
    const progressRecord = await lessonProgressService.markLessonCompleted(user.id, lessonId, courseId)

    if (!progressRecord) {
      // Handle cases where marking failed (e.g., lesson not found by service)
       return res.status(500).json({ message: 'Failed to mark lesson as complete.' })
    }

    // 4. Respond with success
    return res.status(200).json({ message: 'Lesson marked as complete.', status: progressRecord.status })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    payload.logger.error(`Error in markCompleteHandler for lesson ${lessonId}, user ${user.id}: ${message}`, error)
    return res.status(500).json({ message: 'An error occurred while marking the lesson complete.' })
  }
}

// Export default
export default markCompleteHandler;