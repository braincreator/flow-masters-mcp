import { PayloadRequest } from 'payload'
import { Response, NextFunction } from 'express'
import { ServiceRegistry } from '@/services/service.registry'
import { Course } from '@/payload-types' // Import Course type

export async function enrollFreeHandler(req: PayloadRequest, res: Response, next: NextFunction): Promise<Response | void> {
  const { payload, user } = req
  const courseId = (req as any).courseId // Try accessing directly, casting req to any

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' })
  }

  if (!courseId) {
    return res.status(400).json({ message: 'Missing courseId parameter.' })
  }

  try {
    // 1. Verify the course exists and is actually free
    // Note: @ts-expect-error removed as unused
    const course: Course | null = await payload.findByID({
      collection: 'courses',
      id: courseId,
      depth: 0,
    })

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' })
    }

    if (course.accessType !== 'free') {
      return res.status(403).json({ message: 'This course is not free.' })
    }

    // 2. Enroll the user using the EnrollmentService
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const enrollmentService = serviceRegistry.getEnrollmentService()

    const enrollment = await enrollmentService.enrollUserInCourse({
      userId: user.id,
      courseId: courseId,
      source: 'free', // Explicitly set source
    })

    if (!enrollment) {
      // enrollUserInCourse might return null or throw an error if something went wrong internally
      return res.status(500).json({ message: 'Failed to enroll user.' })
    }

    // 3. Respond with success (or the enrollment object)
    return res.status(200).json({ message: 'Successfully enrolled in free course.', enrollmentId: enrollment.id })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    payload.logger.error(`Error in enrollFreeHandler for course ${courseId}, user ${user.id}: ${message}`, error)
    return res.status(500).json({ message: 'An error occurred during enrollment.' })
  }
}

// Export default for potential dynamic import or direct use
export default enrollFreeHandler;