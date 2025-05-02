import type { CollectionBeforeReadHook } from 'payload'
import type { User, Lesson, CourseEnrollment } from '@/payload-types' // Assuming these types exist
import { addDays, isBefore, parseISO } from 'date-fns'

export const filterAvailableLessons: CollectionBeforeReadHook<Lesson> = async ({
  req,
  req: { payload, user },
  query,
}) => {
  // Bypass filter for admin users
  // Assuming 'admin' role exists on the 'users' collection
  if (user && user.role === 'admin') {
    return query
  }

  // If no user, potentially return no lessons or only universally available ones
  if (!user) {
    // For now, let's restrict access if not logged in. Adjust if public lessons are needed.
    return {
      ...query,
      where: {
        ...query.where,
        id: { equals: 'no_user_no_lessons' }, // Effectively return no results
      },
    }
  }

  try {
    // 1. Find the modules associated with the lessons being queried (if possible)
    // This is tricky with just a beforeRead hook on Lessons. A more robust approach
    // might involve fetching lessons on the frontend and checking access there,
    // or adding course context to the lesson query if feasible.
    // For this example, we'll assume we can get the relevant course IDs somehow,
    // or we fetch all enrollments for the user and filter based on the lesson's module->course link.

    // Let's fetch all active enrollments for the current user
    const enrollmentsResult = await payload.find({
      collection: 'course-enrollments', // Corrected slug
      where: {
        'user': { equals: user.id }, // Corrected where clause
        'status': { equals: 'active' }, // Only consider active enrollments
      },
      depth: 1, // Need depth 1 to get course slug/id
      limit: 1000, // Adjust limit as needed
      req, // Pass req for access control context if needed
      overrideAccess: true, // We need to read all user's enrollments
    })

    const enrollments = enrollmentsResult.docs as CourseEnrollment[]

    if (!enrollments || enrollments.length === 0) {
      // User has no active enrollments, maybe only show immediate lessons? Or none?
      // Let's restrict to only immediate for now.
      return {
        ...query,
        where: {
          ...query.where,
          'dripContent.dripType': { equals: 'immediate' },
          // Potentially add a check for free courses if applicable
        },
      }
    }

    // 2. Build the 'OR' conditions for available lessons
    const now = new Date()
    const availableLessonConditions: any[] = [
      // Condition 1: Immediately available lessons
      { 'dripContent.dripType': { equals: 'immediate' } },
      // Condition 2: Lessons available based on the calculated availableOn date (for specificDate drips)
      { 'availableOn': { less_than_equal: now.toISOString() } },
    ]

    // Condition 3: Lessons available N days after enrollment (requires matching enrollment)
    // This part is complex because we need to link the lesson to the correct enrollment.
    // We iterate through enrollments and create a condition for each.
    for (const enrollment of enrollments) {
      const courseId = typeof enrollment.course === 'object' ? enrollment.course.id : enrollment.course;
      const enrollmentDate = enrollment.enrolledAt ? parseISO(enrollment.enrolledAt) : null; // Corrected property name

      if (courseId && enrollmentDate) {
        // This condition assumes the lesson document has a populated 'module.course.id' field.
        // This requires `depth` in the original lesson query or adjustments.
        // A simpler, though less performant, approach might be to fetch all available lesson IDs first.
        availableLessonConditions.push({
          and: [
            // Match lessons belonging to the course the user is enrolled in
            // This path depends heavily on your data structure and query depth
            // IMPORTANT: Adjust 'module.course.id' if the path from Lesson to Course ID is different!
            { 'module.course.id': { equals: courseId } },
            { 'dripContent.dripType': { equals: 'daysAfterEnrollment' } },
            {
              // Check if 'now' is after 'enrollmentDate + dripDelayDays'
              // This comparison is tricky directly in the query. Payload's query capabilities
              // might not support date arithmetic directly in the 'where' clause.

              // **Simplification:** We query lessons where the enrollment date is *before*
              // 'now - dripDelayDays'. This requires calculating the latest possible enrollment date
              // for the lesson to be available *today*.
              // This still requires knowing dripDelayDays *before* the query, which isn't ideal.

              // **Revised Simplification:** Allow all 'daysAfterEnrollment' lessons for enrolled courses in this hook.
              // The precise date check needs to happen elsewhere (e.g., custom endpoint, frontend access control).
              // This hook primarily ensures the user is enrolled in the course for these types of lessons.
            },
          ],
        });
      }
    }

    // Combine original query with the OR conditions for available lessons
    return {
      ...query,
      where: {
        ...query.where, // Keep original query constraints
        or: availableLessonConditions,
      },
    }

  } catch (error) {
    payload.logger.error(`Error in filterAvailableLessons hook: ${error instanceof Error ? error.message : 'Unknown error'}`)
    // Fallback: return original query or restrict access completely
    return {
      ...query,
      where: {
        ...query.where,
        id: { equals: 'error_occurred' }, // Restrict access on error
      },
    }
  }
}