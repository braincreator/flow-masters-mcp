import { Payload } from 'payload'
// Assessment and AssessmentSubmission might not exist yet in types
import { User, Course, /* Assessment, AssessmentSubmission, */ CourseEnrollment, Certificate } from '@/payload-types'
import { ServiceRegistry } from '../service.registry'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import { EmailService } from '../email.service' // Ensure only one import

export interface EnrollmentData {
  userId: string
  courseId: string
  source?: 'purchase' | 'admin' | 'promotion' | 'subscription' | 'free'
  orderId?: string
  expiresAt?: string // ISO String
  notes?: string
}

export class EnrollmentService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Enrolls a user in a course, or reactivates an expired enrollment.
   */
  async enrollUserInCourse(data: EnrollmentData): Promise<CourseEnrollment | null> {
    try {
      // Check if user is already enrolled (and not revoked)
      const existingEnrollmentResult = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            { user: { equals: data.userId } },
            { course: { equals: data.courseId } },
            { status: { not_equals: 'revoked' } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      if (existingEnrollmentResult.docs.length > 0) {
        const enrollment = existingEnrollmentResult.docs[0]
        if (enrollment) {
          // If active or completed, just return it
          if (enrollment.status === 'active' || enrollment.status === 'completed') {
            logDebug(`User ${data.userId} already actively enrolled in course ${data.courseId}.`)
            return enrollment
          }

          // If expired, reactivate it
          if (enrollment.status === 'expired') {
            logDebug(`Reactivating expired enrollment for user ${data.userId} in course ${data.courseId}.`)
            const reactivatedEnrollment = await this.payload.update({
              collection: 'course-enrollments',
              id: enrollment.id,
              data: {
                status: 'active',
                enrolledAt: new Date().toISOString(),
                expiresAt: data.expiresAt,
                // Cast source temporarily due to potential outdated types
                source: (data.source || enrollment.source) as any,
                orderId: data.orderId || enrollment.orderId,
                notes: data.notes || enrollment.notes,
                progress: enrollment.progress || 0,
              },
            })
            // Optionally trigger a 're-enrollment' notification/event here
            // Cast return value temporarily due to potential outdated types
            return reactivatedEnrollment as any as CourseEnrollment
          }
        }
      }

      // Create new enrollment if no suitable existing one found
      logDebug(`Creating new enrollment for user ${data.userId} in course ${data.courseId}.`)
      const newEnrollment = await this.payload.create({
        collection: 'course-enrollments',
        data: {
          user: data.userId,
          course: data.courseId,
          status: 'active',
          enrolledAt: new Date().toISOString(),
          expiresAt: data.expiresAt,
          progress: 0,
          // Cast source temporarily due to potential outdated types
          source: (data.source || 'admin') as any,
          orderId: data.orderId,
          notes: data.notes,
        },
      })

      // Track enrollment event and send notification/email
      try {
        const serviceRegistry = ServiceRegistry.getInstance(this.payload)
        if (serviceRegistry) {
          // Track achievement event
          const achievementService = serviceRegistry.getAchievementService()
          await achievementService.processEvent({
            userId: data.userId,
            courseId: data.courseId,
            eventType: 'course_started',
          })

          // Trigger enrollment notification & email
          const notificationService = serviceRegistry.getNotificationService()
          const emailService = serviceRegistry.getEmailService() // Get EmailService instance

          // Fetch User and Course details for notifications/email
          const user: any = await this.payload.findByID({ collection: 'users', id: data.userId, depth: 0 })
          const course: any = await this.payload.findByID({
            collection: 'courses',
            id: data.courseId,
            depth: 0,
          })
          const courseTitle = course?.title || 'the course'

          // Send In-App Notification
          await notificationService.sendNotification({
            userId: data.userId,
            type: 'course_enrolled',
            title: `Successfully Enrolled!`,
            message: `You have successfully enrolled in ${courseTitle}. Start learning now!`,
            link: `/courses/${data.courseId}`, // Consider linking to the course dashboard page
            metadata: {
              courseId: data.courseId,
              enrollmentId: newEnrollment.id,
              expiresAt: data.expiresAt,
              source: data.source,
              orderId: data.orderId,
            },
          })

          // Send Enrollment Confirmation Email
          if (emailService && user && course) {
            try {
              await emailService.sendCourseEnrollmentEmail({
                userName: user.name || 'Student',
                email: user.email,
                courseId: data.courseId, // Added missing courseId
                courseName: course.title || 'the course',
                courseUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/courses/${course.slug || data.courseId}`,
                expiresAt: data.expiresAt,
                // source is not part of CourseEnrollmentEmailData
                locale: user.locale || 'en',
              })
            } catch (emailError) {
              logError(`Failed to send enrollment confirmation email to ${user.email}:`, emailError)
            }
          } else {
            if (!emailService) logError('EmailService not available.')
            if (!user) logError(`User ${data.userId} not found for enrollment email.`)
            if (!course) logError(`Course ${data.courseId} not found for enrollment email.`)
          }
        }
      } catch (eventError) {
        logError('Error processing enrollment events (achievement/notification/email):', eventError)
      }

      return newEnrollment
    } catch (error) {
      logError('Error enrolling user in course:', error)
      throw error
    }
  }

  /**
   * Checks if a user has access to a course (active enrollment, free, or admin).
   */
  async hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      // --- 1. Fetch User and Course data concurrently (Performance) ---
      // Fetching user and course details in parallel improves performance slightly.
      const [userResult, courseResult] = await Promise.all([
        this.payload.findByID({ collection: 'users', id: userId, depth: 0 }),
        this.payload.findByID({ collection: 'courses', id: courseId, depth: 0 }),
      ]);

      // Explicitly type results for better type safety (Best Practices)
      // Assuming findByID returns the document or null if not found. Adjust if it throws.
      const user: User | null = userResult as User | null;
      const course: Course | null = courseResult as Course | null;

      // --- 2. Check Admin Access (Readability & Best Practices) ---
      // Admins have universal access. Check this first for a quick exit.
      if (user?.roles?.includes('admin')) {
        // logDebug(`User ${userId} has admin access to course ${courseId}.`); // Optional: uncomment for debugging
        return true;
      }

      // --- 3. Check Course Existence and Free Access (Readability & Best Practices) ---
      // If the course doesn't exist, access is impossible.
      if (!course) {
        logWarn(`Course ${courseId} not found during access check for user ${userId}. Access denied.`);
        return false;
      }
      // If the course is free, grant access immediately.
      if (course.accessType === 'free') {
        // logDebug(`Course ${courseId} is free. Granting access to user ${userId}.`); // Optional: uncomment for debugging
        return true;
      }

      // --- 4. Placeholder for Subscription Check (Readability & Maintainability) ---
      // Structure allows easy addition of subscription logic later without disrupting flow.
      if (course.accessType === 'subscription') {
        logWarn(`Subscription access check for course ${courseId} (user ${userId}) is not implemented yet.`);
        // TODO: Implement subscription check logic here.
        // This might involve checking user subscriptions against course requirements.
        // For now, we assume no access via subscription if not implemented.
        // Example future call: return await this.checkSubscriptionAccess(userId, course);
      }

      // --- 5. Check Active Enrollment (Readability & Best Practices) ---
      // Query for an active enrollment for this specific user and course.
      // Using limit: 1 and depth: 0 is efficient.
      const enrollmentResult = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            { user: { equals: userId } },
            { course: { equals: courseId } },
            { status: { equals: 'active' } }, // Only consider 'active' enrollments
          ],
        },
        limit: 1,
        depth: 0, // No need for related data (user/course) here
      });

      if (enrollmentResult.docs.length > 0) {
        // Explicitly type the enrollment for clarity (Best Practices)
        const enrollment: CourseEnrollment = enrollmentResult.docs[0] as CourseEnrollment;

        // Check if the enrollment is valid and hasn't expired.
        if (enrollment) {
          // If expiresAt is null/undefined, access is considered permanent for this enrollment.
          if (!enrollment.expiresAt) {
            // logDebug(`User ${userId} has an active, non-expiring enrollment for course ${courseId}.`); // Optional: uncomment for debugging
            return true;
          }
          // Compare current time with expiration date. new Date() handles ISO strings.
          const now = new Date();
          const expiresAt = new Date(enrollment.expiresAt);
          if (now < expiresAt) {
            // logDebug(`User ${userId} has an active, valid enrollment for course ${courseId} (expires: ${enrollment.expiresAt}).`); // Optional: uncomment for debugging
            return true;
          } else {
            // console.log(`User ${userId}'s enrollment for course ${courseId} has expired (expired: ${enrollment.expiresAt}).`); // Optional: uncomment for debugging
            // Note: Consider updating expired enrollments status via a separate job/process.
          }
        }
      }

      // --- 6. No Access Found ---
      // If none of the above conditions (admin, free, active/valid enrollment) are met.
      // logDebug(`User ${userId} does not have access to course ${courseId}.`); // Optional: uncomment for debugging
      return false;

    } catch (error: unknown) { // Explicitly type error (Best Practices)
      // --- 7. Error Handling (Robustness & Error Handling) ---
      // Log the error for debugging purposes. Using error.message if it's an Error instance.
      logError(
        `Error checking course access for user ${userId}, course ${courseId}:`,
        error instanceof Error ? error.message : error,
      );
      // Return false as a fail-safe mechanism. Prevents granting access due to unexpected errors.
      return false;
    }
  }

  /**
   * Gets all courses a user has access to (via enrollment or free).
   */
  async getUserCourses(userId: string): Promise<Course[]> {
    try {
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          user: { equals: userId },
          status: { in: ['active', 'completed'] },
        },
        depth: 1,
        limit: 1000,
      })

      const freeCourses = await this.payload.find({
        collection: 'courses',
        where: {
          accessType: { equals: 'free' },
          status: { equals: 'published' },
        },
        depth: 0,
        limit: 1000,
      })

      const enrolledCourses = enrollments.docs
        .map((enrollment) => enrollment.course)
        .filter((course): course is Course => typeof course === 'object' && course !== null)

      const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id))

      const allAccessibleCourses = [
        ...enrolledCourses,
        ...freeCourses.docs.filter((course) => !enrolledCourseIds.has(course.id)),
      ]

      const uniqueCourses = Array.from(new Map(allAccessibleCourses.map((c) => [c.id, c])).values())
      return uniqueCourses
    } catch (error) {
      logError(`Error getting user courses for user ${userId}:`, error)
      return []
    }
  }

  /**
   * Updates user progress in a course, checks for completion, and triggers events.
   * NOTE: This should ideally be triggered by lessonProgressService after a lesson is completed.
   * The progress calculation here is simplified.
   */
  async updateCourseProgress(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    try {
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            { user: { equals: userId } },
            { course: { equals: courseId } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      if (enrollments.docs.length === 0) {
        logWarn(`No active enrollment found for user ${userId} in course ${courseId} to update progress.`)
        return null
      }

      const enrollment = enrollments.docs[0]
      if (!enrollment) {
        logError('Enrollment record null/undefined unexpectedly after length check.')
        return null
      }

      // --- Calculate Progress ---
      const lessonProgress = await this.payload.find({
        collection: 'lesson-progress',
        where: {
          user: { equals: userId },
          course: { equals: courseId },
          status: { equals: 'completed' },
        },
        limit: 0,
      })
      const completedLessonsCount = lessonProgress.totalDocs

      const courseLessons = await this.payload.find({
        collection: 'lessons',
        where: {
          // Assuming direct relation for simplicity, might need module relation if not direct
          course: { equals: courseId },
          status: { equals: 'published' },
        },
        limit: 0,
      })
      const totalLessonsCount = courseLessons.totalDocs
      const calculatedProgress =
        totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0
      const newProgress = Math.min(100, Math.max(0, calculatedProgress))

      // --- Update Enrollment ---
      if (newProgress === enrollment.progress) {
        await this.payload.update({
          collection: 'course-enrollments',
          id: enrollment.id,
          data: { lastAccessedAt: new Date().toISOString() },
        })
        return enrollment
      }

      let updatedEnrollment = await this.payload.update({
        collection: 'course-enrollments',
        id: enrollment.id,
        data: {
          progress: newProgress,
          lastAccessedAt: new Date().toISOString(),
        },
      })

      // --- Trigger Progress Events ---
      try {
        const serviceRegistry = ServiceRegistry.getInstance(this.payload)
        if (serviceRegistry) {
          const achievementService = serviceRegistry.getAchievementService()
          const notificationService = serviceRegistry.getNotificationService()
          const emailService = serviceRegistry.getEmailService() // Get EmailService instance

          await achievementService.processEvent({
            userId,
            courseId,
            eventType: 'course_progress',
            value: newProgress,
          })

          const previousProgress = enrollment.progress || 0
          const milestones = [25, 50, 75]
          for (const milestone of milestones) {
            if (previousProgress < milestone && newProgress >= milestone) {
              try {
                const course: any = await this.payload.findByID({ collection: 'courses', id: courseId })
                await notificationService.sendNotification({
                  userId,
                  type: 'course_progress_milestone',
                  title: `You've reached ${milestone}% in ${course?.title || 'the course'}!`,
                  message: `Keep up the great work! You're making fantastic progress.`,
                  link: `/courses/${courseId}`,
                  metadata: { courseId, courseName: course?.title, progressPercentage: milestone },
                })
              } catch (milestoneError) {
                logError(`Error sending ${milestone}% progress notification:`, milestoneError)
              }
            }
          }

          // --- Check for Course Completion ---
          if (newProgress >= 100) {
            const course: any = await this.payload.findByID({
              collection: 'courses',
              id: courseId,
              depth: 0,
            })

            let canComplete = true
            if (course?.finalAssessment) {
              canComplete = false
              const assessmentId = typeof course.finalAssessment === 'string' ? course.finalAssessment : course.finalAssessment?.id

              // Using lowercase slug 'assessments' - adjust if incorrect based on actual config
              const assessment: any = await this.payload.findByID({
                collection: 'assessments', // Reverted to lowercase slug
                id: assessmentId,
                depth: 0,
              })

              if (assessment?.passingScore != null) {
                // Using lowercase slug 'assessmentSubmissions' - adjust if incorrect based on actual config
                const submissions = await this.payload.find({
                  collection: 'assessment-submissions', // Corrected slug to kebab-case
                  where: {
                    and: [
                      { user: { equals: userId } },
                      { assessment: { equals: assessmentId } },
                      { enrollment: { equals: enrollment.id } },
                      { status: { equals: 'graded' } },
                    ],
                  },
                  sort: '-submittedAt',
                  limit: 1,
                  depth: 0,
                })

                if (submissions.docs.length > 0) {
                  const latestSubmission = submissions.docs[0] as any // Cast to any to access score
                  // Using optional chaining for score access
                  if (latestSubmission && latestSubmission?.score != null && latestSubmission.score >= assessment.passingScore) {
                    canComplete = true
                  } else {
                    // Using optional chaining for score access in log
                    logDebug(`User ${userId} reached 100% in course ${courseId}, but did not pass final assessment ${assessmentId}. Score: ${latestSubmission?.score}, Required: ${assessment.passingScore}`)
                  }
                } else {
                  logDebug(`User ${userId} reached 100% in course ${courseId}, but no graded final assessment ${assessmentId} submission found.`)
                }
              } else {
                logWarn(`Final assessment ${assessmentId} for course ${courseId} has no passing score defined. Allowing completion.`)
                canComplete = true
              }
            }

            if (canComplete) {
              logDebug(`Marking course ${courseId} as completed for user ${userId}.`)
              updatedEnrollment = await this.payload.update({ // Re-assign updatedEnrollment
                collection: 'course-enrollments',
                id: enrollment.id,
                data: { status: 'completed', completedAt: new Date().toISOString() },
              })

              await achievementService.processEvent({
                userId,
                courseId,
                eventType: 'course_completed',
                value: 100,
              })

              const certificate = await this.generateCertificate(userId, courseId) as Certificate | null // Added type cast

              try {
                const user: any = await this.payload.findByID({ collection: 'users', id: userId })

                // Send Course Completed Notification
                await notificationService.sendNotification({
                  userId,
                  type: 'course_completed',
                  title: `Congratulations! You completed ${course?.title || 'the course'}!`,
                  message: `You've successfully completed the course. Well done!`,
                  link: certificate ? `/certificates/${certificate.id}` : `/courses/${courseId}`,
                  metadata: {
                    courseId,
                    courseName: course?.title,
                    certificateId: certificate?.certificateId,
                    completionDate: updatedEnrollment.completedAt || new Date().toISOString(),
                  },
                })

                // Send Course Completion Email
                if (emailService && user && course) {
                  await emailService.sendCourseCompletionEmail({
                    userName: user.name || 'Student',
                    email: user.email,
                    courseId: courseId,
                    courseName: course.title || 'the course',
                    completionDate: updatedEnrollment.completedAt || new Date().toISOString(),
                    certificateId: certificate?.certificateId,
                    certificateUrl: certificate ? `${process.env.NEXT_PUBLIC_SERVER_URL}/certificates/${certificate.id}` : undefined,
                    locale: user.locale || 'en',
                  }).catch(err => logError('Failed to send course completion email:', err))
                }

                // Send Certificate Issued Notification & Email (if certificate exists)
                if (certificate) {
                  await notificationService.sendNotification({
                    userId,
                    type: 'certificate_issued',
                    title: `Your Certificate for ${course?.title || 'the course'} is Ready!`,
                    message: `View and download your certificate for completing ${course?.title || 'the course'}.`,
                    link: `/certificates/${certificate.id}`,
                    metadata: {
                      courseId,
                      courseName: course?.title,
                      certificateId: certificate.certificateId,
                      completionDate: updatedEnrollment.completedAt || new Date().toISOString(),
                    },
                  })

                  if (emailService && user && course) {
                     await emailService.sendCourseCertificateEmail({
                       userName: user.name || 'Student',
                       email: user.email,
                       courseId: courseId,
                       courseName: course.title || 'the course',
                       certificateId: certificate.certificateId,
                       certificateUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/certificates/${certificate.id}`,
                       completionDate: updatedEnrollment.completedAt || new Date().toISOString(),
                       locale: user.locale || 'en',
                     }).catch(err => logError('Failed to send course certificate email:', err))
                  }
                }
              } catch (completionNotificationError) {
                logError('Error sending completion notifications/emails:', completionNotificationError)
              }
            } else {
              logDebug(`User ${userId} completed lessons for course ${courseId}, but final assessment not passed/found. Course not marked complete.`)
            }
          }
        }
      } catch (eventError) {
        logError('Error processing progress events:', eventError)
      }

      return updatedEnrollment
    } catch (error) {
      logError(`Error updating course progress for user ${userId}, course ${courseId}:`, error)
      throw error
    }
  }

  /**
   * Revokes a user's access to a course.
   */
  async revokeCourseAccess(userId: string, courseId: string, reason?: string): Promise<CourseEnrollment | null> {
    try {
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            { user: { equals: userId } },
            { course: { equals: courseId } },
            { status: { not_equals: 'revoked' } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      if (enrollments.docs.length === 0) {
        throw new Error('User is not enrolled in this course or access already revoked.')
      }

      const enrollment = enrollments.docs[0]
      if (!enrollment) {
        throw new Error('Enrollment record not found unexpectedly.')
      }

      console.log(`Revoking access for user ${userId} to course ${courseId}. Reason: ${reason || 'N/A'}`)
      return await this.payload.update({
        collection: 'course-enrollments',
        id: enrollment.id,
        data: {
          status: 'revoked',
          notes: reason ? `${enrollment.notes || ''}\n\nRevoked: ${reason}`.trim() : enrollment.notes,
        },
      })
    } catch (error) {
      logError(`Error revoking course access for user ${userId}, course ${courseId}:`, error)
      throw error
    }
  }

  /**
   * Generates a certificate if the user has completed the course.
   */
  async generateCertificate(userId: string, courseId: string): Promise<any> { // Return type might be Certificate | null
    try {
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            { user: { equals: userId } },
            { course: { equals: courseId } },
            { status: { equals: 'completed' } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      if (enrollments.docs.length === 0) {
        logDebug(`Certificate generation skipped: User ${userId} has not completed course ${courseId}.`)
        return null
      }

      const enrollment = enrollments.docs[0]
      if (!enrollment) {
        logError('Completed enrollment record null/undefined unexpectedly.')
        return null
      }

      const existingCertificates = await this.payload.find({
        collection: 'certificates',
        where: {
          and: [
            { user: { equals: userId } },
            { course: { equals: courseId } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      if (existingCertificates.docs.length > 0) {
        logDebug(`Certificate already exists for user ${userId}, course ${courseId}.`)
        return existingCertificates.docs[0]
      }

      const user: any = await this.payload.findByID({ collection: 'users', id: userId })
      const course: any = await this.payload.findByID({ collection: 'courses', id: courseId })

      if (!user || !course) {
        throw new Error(`User or Course not found for certificate generation (User: ${userId}, Course: ${courseId})`)
      }

      const certificateId = `CERT-${courseId.substring(0, 8)}-${userId.substring(0, 8)}-${Date.now().toString(36)}`

      logDebug(`Generating certificate ${certificateId} for user ${userId}, course ${courseId}.`)
      const certificate = await this.payload.create({
        collection: 'certificates',
        data: {
          certificateId,
          user: userId,
          userName: user.name || 'Student',
          course: courseId,
          courseTitle: course.title,
          completionDate: enrollment.completedAt || new Date().toISOString(),
          issueDate: new Date().toISOString(),
          instructor: course.author || null,
          status: 'active',
        },
      })

      try {
        const serviceRegistry = ServiceRegistry.getInstance(this.payload)
        if (serviceRegistry) {
          const achievementService = serviceRegistry.getAchievementService()
          await achievementService.processEvent({
            userId,
            courseId,
            eventType: 'certificate_earned',
            metadata: {
              certificateId,
              certificateUrl: `/certificates/${certificate.id}`,
            },
          })
        }
      } catch (achievementError) {
        logError('Error tracking certificate generation achievement:', achievementError)
      }

      return certificate
    } catch (error) {
      logError(`Error generating certificate for user ${userId}, course ${courseId}:`, error)
      return null
    }
  }

  /**
   * Gets all certificates for a user.
   */
  async getUserCertificates(userId: string): Promise<any[]> { // Return type might be Certificate[]
    try {
      const certificates = await this.payload.find({
        collection: 'certificates',
        where: { user: { equals: userId } },
        depth: 1,
        limit: 1000,
      })
      return certificates.docs
    } catch (error) {
      logError(`Error getting user certificates for user ${userId}:`, error)
      return []
    }
  }

  /**
   * Handles a user's request to cancel their enrollment.
   * Includes eligibility checks and updates status.
   */
  async requestEnrollmentCancellation(userId: string, enrollmentId: string): Promise<CourseEnrollment | null> {
    try {
      // 1. Fetch the enrollment with course details
      const enrollment = await this.payload.findByID({
        collection: 'course-enrollments',
        id: enrollmentId,
        depth: 1, // Need course accessDuration if applicable
      });

      // 2. Validate enrollment exists and belongs to the user
      if (!enrollment || enrollment.user !== userId) {
        throw new Error('Enrollment not found or does not belong to the user.');
      }

      // 3. Check current status
      if (enrollment.status !== 'active') {
        throw new Error(`Cannot cancel enrollment with status: ${enrollment.status}`);
      }

      // 4. Check eligibility rules (Example rules - adjust as needed)
      const now = new Date();
      const enrolledAt = new Date(enrollment.enrolledAt);
      const daysSinceEnrollment = (now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24);
      const progress = enrollment.progress || 0;

      const CANCELLATION_WINDOW_DAYS = 7; // Example: 7-day window
      const MAX_PROGRESS_PERCENTAGE = 10; // Example: Max 10% progress

      if (daysSinceEnrollment > CANCELLATION_WINDOW_DAYS) {
        throw new Error(`Cancellation window of ${CANCELLATION_WINDOW_DAYS} days has passed.`);
      }

      if (progress > MAX_PROGRESS_PERCENTAGE) {
        throw new Error(`Cannot cancel enrollment with progress exceeding ${MAX_PROGRESS_PERCENTAGE}%.`);
      }

      // 5. Process cancellation (Update status)
      logDebug(`Processing cancellation for enrollment ${enrollmentId} by user ${userId}.`);
      const updatedEnrollment = await this.payload.update({
        collection: 'course-enrollments',
        id: enrollmentId,
        data: {
          status: 'revoked', // Use 'revoked' status for cancellation
          notes: `${enrollment.notes || ''}\n\nCancelled by user on ${now.toISOString()}`.trim(),
        },
      });

      // 6. Trigger Refund (Placeholder - requires payment service integration)
      if (enrollment.source === 'purchase' && enrollment.orderId) {
        logDebug(`TODO: Initiate refund process for order ${enrollment.orderId} via payment service.`);
        // const paymentService = ServiceRegistry.getInstance(this.payload)?.getPaymentService();
        // if (paymentService) {
        //   await paymentService.processRefund(enrollment.orderId, enrollmentId);
        // } else {
        //   logError('PaymentService not available for refund processing.');
        // }
      }

      // 7. Send Notification/Email
      try {
        const serviceRegistry = ServiceRegistry.getInstance(this.payload);
        const notificationService = serviceRegistry?.getNotificationService();
        const emailService = serviceRegistry?.getEmailService(); // Keep email service logic if needed later

        // Fetch user data if not already available (needed for email/name)
        const user = await this.payload.findByID({ collection: 'users', id: userId, depth: 0 });
        // Course data should be populated from the initial enrollment fetch (depth: 1)
        const course = enrollment.course as Course;

        if (notificationService && user && course) {
          await notificationService.sendNotification({
            userId: userId,
            type: 'enrollment_cancelled', // Specific notification type
            title: `Enrollment Cancelled: ${course.title}`,
            message: `Your enrollment in the course "${course.title}" has been successfully cancelled.`,
            link: `/courses/${course.id}`, // Link to the course page or user dashboard
            metadata: {
              courseId: course.id,
              courseTitle: course.title,
              enrollmentId: enrollmentId,
              cancelledAt: updatedEnrollment.updatedAt || new Date().toISOString(), // Use update timestamp
            },
          });
        } else {
           if (!notificationService) logWarn('NotificationService not available for cancellation notification.');
           if (!user) logWarn(`User ${userId} not found for cancellation notification.`);
           if (!course) logWarn(`Course data not populated for cancellation notification (Enrollment ID: ${enrollmentId}).`);
        }

        // TODO: Add email sending logic here if required, similar to enrollment confirmation
        // if (emailService && user && course) { ... }

      } catch (notificationError) {
        logError('Error sending cancellation notification/email:', notificationError);
      }

      // Re-fetch the updated enrollment to ensure correct return type
      const finalEnrollment = await this.payload.findByID({
        collection: 'course-enrollments',
        id: enrollmentId,
        depth: 0, // Adjust depth if needed
      });

      return finalEnrollment;

    } catch (error) {
      logError(`Error requesting enrollment cancellation for enrollment ${enrollmentId}:`, error);
      // Re-throw specific eligibility errors or a generic one
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('Cannot cancel') || error.message.includes('window') || error.message.includes('progress'))) {
        throw error; // Re-throw specific validation/eligibility errors
      }
      throw new Error('Failed to process cancellation request.');
    }
  }
}
