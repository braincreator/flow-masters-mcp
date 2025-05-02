import { PayloadRequest } from 'payload'
import { Response, NextFunction } from 'express'
import { ServiceRegistry } from '@/services/service.registry'
import { NotificationService } from '@/services/notification.service' // Added import
import { Assessment, Lesson, CourseEnrollment } from '@/payload-types' // Import types

// Define expected request body structure (adjust based on frontend)
interface AssessmentSubmissionPayload {
  answers?: Record<string, any> // For quizzes: { questionId: answerValue }
  files?: string[] // For assignments: Array of media IDs
}

export async function submitHandler(req: PayloadRequest, res: Response, next: NextFunction): Promise<Response | void> {
  const { payload, user, body } = req
  const assessmentId = (req as any).assessmentId // Assuming assessmentId is available directly on req
  const submissionData = body as AssessmentSubmissionPayload

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' })
  }

  if (!assessmentId) {
    return res.status(400).json({ message: 'Missing assessmentId parameter.' })
  }

  if (!submissionData || (!submissionData.answers && !submissionData.files)) {
     return res.status(400).json({ message: 'Missing submission data (answers or files).' })
  }

  try {
    // 1. Fetch Assessment details (including related Lesson)
    // Note: @ts-expect-error removed as unused
    const assessment: any = await payload.findByID({ // Using any temporarily
      collection: 'assessments', // Reverted to lowercase slug
      id: assessmentId,
      depth: 1, // Populate lesson
    })

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' })
    }

    const lesson = assessment.lesson as Lesson // Assuming lesson is populated
    if (!lesson || typeof lesson !== 'object') {
        return res.status(500).json({ message: 'Could not find associated lesson for the assessment.' })
    }
    const lessonId = lesson.id

    // 2. Find the user's active enrollment for the course
    // Need courseId from lesson -> module -> course
    const moduleId = typeof lesson.module === 'string' ? lesson.module : lesson.module?.id
    if (!moduleId) return res.status(500).json({ message: 'Lesson module information missing.' })
    // Note: @ts-expect-error removed as unused
    const moduleDoc = await payload.findByID({ collection: 'modules', id: moduleId, depth: 1 }) // Depth 1 for course
    const courseId = typeof moduleDoc?.course === 'string' ? moduleDoc.course : moduleDoc?.course?.id
    if (!courseId) return res.status(500).json({ message: 'Could not determine course for the lesson.' })

    const enrollments = await payload.find({
        collection: 'course-enrollments',
        where: {
            and: [
                { user: { equals: user.id } },
                { course: { equals: courseId } },
                { status: { equals: 'active' } },
            ]
        },
        limit: 1,
        depth: 0,
    })

    if (enrollments.docs.length === 0) {
        return res.status(403).json({ message: 'You are not actively enrolled in the course for this assessment.' })
    }
    const enrollment = enrollments.docs[0] as CourseEnrollment // Cast to type

    // 3. Check Max Attempts (if implemented)
    // TODO: Add logic to count previous submissions for this user/assessment/enrollment
    // and compare against assessment.maxAttempts if > 0

    // 4. Create AssessmentSubmission record
    const submissionStatus = assessment.type === 'quiz' ? 'grading' : 'submitted' // Auto-grade quizzes later
    const newSubmission = await payload.create({
        collection: 'assessmentSubmissions', // Reverted to lowercase slug
        data: {
            assessment: assessmentId,
            user: user.id,
            enrollment: enrollment.id,
            submittedAt: new Date().toISOString(),
            // @ts-expect-error // Status type mismatch until types regenerated
            status: submissionStatus,
            answers: submissionData.answers, // Store raw answers for quizzes
            files: submissionData.files,     // Store file IDs for assignments
            // attemptNumber: calculatedAttemptNumber, // TODO
        },
    })

    // --- Send 'assessment_submitted' Notification ---
    try {
        const serviceRegistry = ServiceRegistry.getInstance(payload)
        const notificationService = serviceRegistry.getNotificationService()
        await notificationService.sendNotification({
            userId: user.id,
            type: 'assessment_submitted',
            title: `Assessment Submitted: ${assessment.title}`,
            message: `You have successfully submitted "${assessment.title}" for lesson "${lesson.title}".`,
            link: `/courses/${courseId}/learn/${lessonId}`, // Link back to the lesson
            metadata: {
                courseId,
                lessonId,
                assessmentId,
                submissionId: newSubmission.id,
                assessmentTitle: assessment.title,
                lessonTitle: lesson.title,
            },
        })
    } catch (notifError) {
        payload.logger.error(`Failed to send assessment submission notification: ${notifError}`)
    }
    // --- End Notification ---

    // 5. Process Quiz Grading (Simplified - Full logic might be in a separate service/job)
    let score: number | null = null
    let passed = false
    if (assessment.type === 'quiz' && submissionData.answers) {
        // TODO: Implement quiz grading logic here or in AssessmentService
        // Compare submissionData.answers with assessment.questions
        // Calculate score based on points
        score = 0 // Placeholder
        passed = score >= (assessment.passingScore ?? 0) // Placeholder

        // Update submission status and score
        await payload.update({
            collection: 'assessmentSubmissions', // Reverted to lowercase slug
            id: newSubmission.id,
            // Using 'as any' for status temporarily
            data: { status: 'graded' as any, score },
        })
    }

    // --- Send 'assessment_graded' Notification (for auto-graded quizzes) ---
    if (assessment.type === 'quiz' && score !== null) { // Check if grading happened
        try {
            const serviceRegistry = ServiceRegistry.getInstance(payload)
            const notificationService = serviceRegistry.getNotificationService()
            await notificationService.sendNotification({
                userId: user.id,
                type: 'assessment_graded',
                title: `Assessment Graded: ${assessment.title}`,
                message: `Your submission for "${assessment.title}" has been graded. Score: ${score}/${assessment.questions?.length || '?'}. ${passed ? 'You passed!' : 'Review required.'}`,
                link: `/courses/${courseId}/learn/${lessonId}`, // Link back to the lesson to see results?
                metadata: {
                    courseId,
                    lessonId,
                    assessmentId,
                    submissionId: newSubmission.id,
                    assessmentTitle: assessment.title,
                    lessonTitle: lesson.title,
                    score,
                    passed,
                    passingScore: assessment.passingScore,
                },
            })
        } catch (notifError) {
            payload.logger.error(`Failed to send assessment graded notification: ${notifError}`)
        }
    }
    // --- End Notification ---

    // 6. If passed and criteria match, mark lesson complete
    // @ts-expect-error // Types not updated yet
    if (passed && lesson.completionCriteria === 'pass_assessment') {
        const serviceRegistry = ServiceRegistry.getInstance(payload)
        const lessonProgressService = serviceRegistry.getLessonProgressService()
        // Use forceComplete=true as the assessment passing fulfills the criteria
        await lessonProgressService.markLessonCompleted(user.id, lessonId, courseId, true)
    }

    // 7. Respond with success (potentially include score/status)
    return res.status(201).json({
        message: 'Assessment submitted successfully.',
        submissionId: newSubmission.id,
        status: submissionStatus, // Initial status
        score: score, // Include score if graded immediately
        passed: passed, // Include pass status if graded immediately
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    payload.logger.error(`Error in submitHandler for assessment ${assessmentId}, user ${user.id}: ${message}`, error)
    return res.status(500).json({ message: 'An error occurred during assessment submission.' })
  }
}

// Export default
export default submitHandler;