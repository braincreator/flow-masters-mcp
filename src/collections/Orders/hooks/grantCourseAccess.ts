import type { CollectionAfterChangeHook } from 'payload'
import type { Order, Product, Course, CourseEnrollment, User } from '@/payload-types' // Assuming types exist
import { addDays, addWeeks, addMonths, addYears } from 'date-fns'

// Helper function to calculate expiry date
const calculateExpiry = (
  startDate: Date,
  durationType: 'unlimited' | 'limited' | undefined,
  duration: number | null | undefined,
  unit: 'days' | 'weeks' | 'months' | 'years' | null | undefined,
): Date | null => {
  if (durationType !== 'limited' || !duration || !unit) {
    return null // No expiry for unlimited or invalid settings
  }

  switch (unit) {
    case 'days':
      return addDays(startDate, duration)
    case 'weeks':
      return addWeeks(startDate, duration)
    case 'months':
      return addMonths(startDate, duration)
    case 'years':
      return addYears(startDate, duration)
    default:
      return null
  }
}

export const grantCourseAccess: CollectionAfterChangeHook<Order> = async ({
  doc, // full document data
  previousDoc, // document data before change
  req,
  req: { payload },
  operation,
}) => {
  // Only run on update operations where status changes to 'paid'
  if (
    operation !== 'update' ||
    doc.status !== 'paid' ||
    previousDoc.status === 'paid' // Avoid running if already paid
  ) {
    return
  }

  const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
  if (!userId) {
    payload.logger.error(`Order ${doc.id} changed to paid but has no valid user ID.`)
    return
  }

  payload.logger.info(`Order ${doc.id} paid by user ${userId}. Checking for course products...`)

  // Iterate through order items
  for (const item of doc.items || []) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product
    if (!productId) continue

    try {
      // Fetch the product and populate its related course (depth 1)
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 1, // Need depth 1 to get the related course object
        req,
      }) as Product | null

      // Check if the product grants access to a course
      // IMPORTANT: Adjust 'relatedCourse' if the field name on your Product collection is different!
      const course = product?.relatedCourse as Course | null
      const courseId = course?.id

      if (course && courseId) {
        payload.logger.info(`Product ${productId} grants access to course ${courseId}. Checking enrollment for user ${userId}.`)

        // Check if user is already actively enrolled
        const existingEnrollment = await payload.find({
          collection: 'course-enrollments',
          where: {
            'user': { equals: userId },
            'course': { equals: courseId },
            'status': { equals: 'active' }, // Check only for active enrollments
          },
          limit: 1,
          req,
          overrideAccess: true, // Need to check existence
        })

        if (existingEnrollment.totalDocs === 0) {
          // User is not actively enrolled, create enrollment
          const now = new Date()
          // IMPORTANT: Adjust 'accessDuration' if the field name on your Course collection is different!
          const expiresAt = calculateExpiry(
            now,
            course.accessDuration?.type,
            course.accessDuration?.duration,
            course.accessDuration?.unit,
          )

          await payload.create({
            collection: 'course-enrollments',
            data: {
              user: userId,
              course: courseId,
              status: 'active',
              enrolledAt: now.toISOString(),
              expiresAt: expiresAt ? expiresAt.toISOString() : null,
              source: 'purchase', // Mark source as purchase
              orderId: doc.id, // Link back to the order
            },
            req,
            overrideAccess: true, // Allow system to create enrollment
          })
          payload.logger.info(`Created enrollment for user ${userId} in course ${courseId}.`)

          // Optional: Remove user from waiting list for this course
          try {
             const waitingListEntries = await payload.find({
                collection: 'waiting-list-entries',
                where: {
                   'user': { equals: userId },
                   'course': { equals: courseId },
                },
                req,
                overrideAccess: true,
             });

             for (const entry of waitingListEntries.docs) {
                await payload.delete({
                   collection: 'waiting-list-entries',
                   id: entry.id,
                   req,
                   overrideAccess: true,
                });
                payload.logger.info(`Removed user ${userId} from waiting list for course ${courseId} (Entry ID: ${entry.id}).`);
             }
          } catch (deleteError) {
             payload.logger.error(`Failed to remove user ${userId} from waiting list for course ${courseId}: ${deleteError instanceof Error ? deleteError.message : deleteError}`);
             // Continue enrollment even if waiting list removal fails
          }

        } else {
          payload.logger.info(`User ${userId} already actively enrolled in course ${courseId}. Skipping enrollment creation.`)
          // Optionally: Update existing enrollment's expiry if the new purchase grants longer access? (More complex logic)
        }
      }
    } catch (error) {
      payload.logger.error(`Error processing item product ID ${productId} for order ${doc.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Continue processing other items even if one fails
    }
  }
}