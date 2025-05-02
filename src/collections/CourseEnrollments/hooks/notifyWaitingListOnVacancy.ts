import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload' // Import Payload
import type { Course, CourseEnrollment, WaitingListEntry, User } from '@/payload-types'
import type { ServiceRegistry } from '@/services/service.registry' // Import ServiceRegistry for type hint

// Combined Hook Logic (can be used for both afterChange and afterDelete)
const checkAndNotifyWaitingList = async (args: {
  payload: Payload // Use augmented Payload type
  courseId: string
  req: any // Pass req for context if needed by underlying API calls
}) => {
  const { payload, courseId, req } = args
  const emailService = (payload as any).services?.getEmailService(); // Get EmailService instance

  if (!emailService) {
    payload.logger.error('EmailService not available in checkAndNotifyWaitingList hook.');
    return;
  }

  try {
    // 1. Fetch the course capacity
    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
      depth: 0,
      req,
    }) as Course | null

    if (!course) {
      payload.logger.warn(`Waiting list check: Course ${courseId} not found.`)
      return
    }

    const capacity = course.enrollmentCapacity ?? 0
    if (capacity <= 0) {
      // No capacity limit, no need to check waiting list
      return
    }

    // 2. Count current active enrollments
    const enrollmentsCountResult = await payload.count({
      collection: 'course-enrollments',
      where: {
        'course': { equals: courseId },
        'status': { equals: 'active' },
      },
      req,
      overrideAccess: true,
    })
    const currentEnrollmentCount = enrollmentsCountResult.totalDocs

    // 3. Check if there's a vacancy
    if (currentEnrollmentCount < capacity) {
      payload.logger.info(`Vacancy detected for course ${courseId} (Capacity: ${capacity}, Current: ${currentEnrollmentCount}). Checking waiting list.`)

      // 4. Find the oldest un-notified waiting list entry
      const waitingListResult = await payload.find({
        collection: 'waiting-list-entries',
        where: {
          'course': { equals: courseId },
          'notified': { equals: false },
        },
        sort: 'createdAt', // Find the oldest entry first
        limit: 1,
        req,
        overrideAccess: true,
      })

      if (waitingListResult.totalDocs > 0) {
        const entryToNotify = waitingListResult.docs[0] as WaitingListEntry
        const userToNotifyId = typeof entryToNotify.user === 'object' ? entryToNotify.user.id : entryToNotify.user

        // Fetch user and course details for the email
        const userToNotify = await payload.findByID({ collection: 'users', id: userToNotifyId, depth: 0, req }) as User | null;
        // Fetch course again or use the one from above if it includes slug/name
        const courseForEmail = await payload.findByID({ collection: 'courses', id: courseId, depth: 0, req }) as Course | null;

        if (!userToNotify || !courseForEmail) {
          payload.logger.error(`Could not fetch user (${userToNotifyId}) or course (${courseId}) details for waiting list notification.`);
          return; // Stop if we can't get necessary details
        }

        payload.logger.info(`Found user ${userToNotify.email} (Entry ID: ${entryToNotify.id}) on waiting list for course ${courseForEmail.title}. Notifying...`)

        // 5. Trigger Notification using EmailService and a template
        const templateSlug = 'waiting-list-vacancy'; // Define a slug for the new template
        const emailData = {
          userName: userToNotify.name || userToNotify.email, // Use name or fallback to email
          email: userToNotify.email,
          courseName: courseForEmail.title,
          courseUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/courses/${courseForEmail.slug || courseId}`, // Construct course URL
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
          // Add any other data your template might need
        };

        const emailSent = await emailService.sendTemplateEmail(
          templateSlug,
          userToNotify.email,
          emailData,
          { locale: userToNotify.locale || 'ru' } // Assuming user has locale preference
        );

        if (!emailSent) {
           payload.logger.error(`Failed to send waiting list notification email via template '${templateSlug}' to ${userToNotify.email}.`);
           // Decide if we should still mark as notified or retry later
           // For now, we'll proceed to mark as notified to avoid spamming on retries
        } else {
           payload.logger.info(`Successfully sent waiting list notification email to ${userToNotify.email}.`);
        }

        // 6. Mark the entry as notified
        try {
          await payload.update({
            collection: 'waiting-list-entries',
            id: entryToNotify.id,
            data: {
              notified: true,
            },
            req,
            overrideAccess: true,
          })
          payload.logger.info(`Marked waiting list entry ${entryToNotify.id} as notified.`)
        } catch (updateError) {
          payload.logger.error(`Failed to mark waiting list entry ${entryToNotify.id} as notified: ${updateError instanceof Error ? updateError.message : updateError}`)
          // Decide how to handle this - potentially retry?
        }
      } else {
        payload.logger.info(`No un-notified users found on waiting list for course ${courseId}.`)
      }
    }
  } catch (error) {
    payload.logger.error(`Error checking/notifying waiting list for course ${courseId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Hook for afterChange (when status becomes inactive)
export const notifyWaitingListOnStatusChange: CollectionAfterChangeHook<CourseEnrollment> = async ({
  doc, // document after change
  previousDoc, // document before change
  req,
  req: { payload },
  operation,
}) => {
  // Run if status changed FROM 'active' TO something else
  if (
    operation === 'update' &&
    previousDoc.status === 'active' &&
    doc.status !== 'active'
  ) {
    const courseId = typeof doc.course === 'object' ? doc.course.id : doc.course
    if (courseId) {
      await checkAndNotifyWaitingList({ payload, courseId, req })
    }
  }
}

// Hook for afterDelete
export const notifyWaitingListOnDelete: CollectionAfterDeleteHook<CourseEnrollment> = async ({
  req,
  req: { payload },
  id, // ID of deleted document
  doc, // The deleted document
}) => {
  // We only care if the deleted enrollment was 'active'
  if (doc.status === 'active') {
    const courseId = typeof doc.course === 'object' ? doc.course.id : doc.course
    if (courseId) {
      await checkAndNotifyWaitingList({ payload, courseId, req })
    }
  }
}