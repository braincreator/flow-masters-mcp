import type { CollectionBeforeChangeHook } from 'payload'
import type { Course, CourseEnrollment, WaitingListEntry, User } from '@/payload-types' // Assuming types exist
import { Forbidden } from 'payload' // Import Forbidden for throwing access errors

export const handleWaitingList: CollectionBeforeChangeHook<CourseEnrollment> = async ({
  req,
  req: { payload, user }, // Assuming user is available on req
  data, // Data being submitted for the new enrollment
  operation,
}) => {
  // Only run this hook when creating a new enrollment
  if (operation !== 'create' || !user) {
    return data
  }

  const courseId = data.course // Assuming 'course' field holds the ID
  const userId = data.user // Assuming 'user' field holds the ID

  if (!courseId || !userId) {
    // Should not happen if fields are required, but good practice to check
    payload.logger.warn('Waiting list hook: Missing courseId or userId in enrollment data.')
    return data // Allow operation but log warning
  }

  try {
    // 1. Fetch the course details, specifically the capacity
    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
      depth: 0, // No need for deep population
      req, // Pass req for potential access control
    }) as Course | null // Type assertion

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found.`)
    }

    const capacity = course.enrollmentCapacity ?? 0 // Default to 0 if null/undefined

    // 2. Check if capacity is limited and reached
    if (capacity > 0) {
      // Count current active enrollments for this course
      const enrollmentsCountResult = await payload.count({
        collection: 'course-enrollments',
        where: {
          'course': { equals: courseId },
          'status': { equals: 'active' }, // Only count active enrollments
        },
        req, // Pass req for potential access control
        overrideAccess: true, // Need to count all relevant enrollments
      })

      const currentEnrollmentCount = enrollmentsCountResult.totalDocs

      // 3. If capacity is reached or exceeded
      if (currentEnrollmentCount >= capacity) {
        payload.logger.info(`Course ${courseId} is full (Capacity: ${capacity}, Current: ${currentEnrollmentCount}). Checking waiting list for user ${userId}.`)

        // Check if user is already on the waiting list for this course
        const existingWaitingEntry = await payload.find({
          collection: 'waiting-list-entries',
          where: {
            'user': { equals: userId },
            'course': { equals: courseId },
          },
          limit: 1,
          req,
          overrideAccess: true, // Need to check existence
        })

        // 4. If not already on the list, add them
        if (existingWaitingEntry.totalDocs === 0) {
          try {
            await payload.create({
              collection: 'waiting-list-entries',
              data: {
                user: userId,
                course: courseId,
                notified: false, // Ensure default is set
              },
              req,
              overrideAccess: true, // Allow system to create waiting list entry
            })
            payload.logger.info(`User ${userId} added to waiting list for course ${courseId}.`)
            // Throw Forbidden error to prevent enrollment and inform user
            throw new Forbidden('This course is currently full. You have been added to the waiting list.')
          } catch (createError) {
             payload.logger.error(`Failed to add user ${userId} to waiting list for course ${courseId}: ${createError instanceof Error ? createError.message : createError}`)
             // If adding to waiting list fails, still prevent enrollment
             throw new Forbidden('This course is currently full, and there was an error adding you to the waiting list. Please contact support.')
          }
        } else {
          payload.logger.info(`User ${userId} is already on the waiting list for course ${courseId}.`)
          // User is already on the list, still prevent duplicate enrollment attempt
          throw new Forbidden('This course is currently full. You are already on the waiting list.')
        }
      }
    }

    // 5. If capacity is not set or not reached, allow enrollment
    payload.logger.info(`Course ${courseId} has capacity. Allowing enrollment for user ${userId}.`)
    return data

  } catch (error) {
    // Log the error
    payload.logger.error(`Error in handleWaitingList hook for course ${courseId}, user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`)

    // If it's the specific Forbidden error we threw, re-throw it
    if (error instanceof Forbidden) {
      throw error;
    }

    // For other unexpected errors, throw a generic error to prevent enrollment
    throw new Error('An unexpected error occurred while checking course capacity. Please try again later.')
  }
}