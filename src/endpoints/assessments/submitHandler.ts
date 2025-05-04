import { PayloadRequest } from 'payload'
import { Response, NextFunction } from 'express'
import { ServiceRegistry } from '@/services/service.registry'
import { NotificationService } from '@/services/notification.service' // Added import
import { Assessment, Lesson, CourseEnrollment } from '@/payload-types' // Import types

// Define expected request body structure (adjust based on frontend)
interface AssessmentSubmissionPayload {
  answers?: Record<string, any> // For quizzes: { [question.id]: answerValue }
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
      depth: 2, // Populate lesson and potentially questions/options
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

    // 3. Check Max Attempts
    const previousSubmissions = await payload.find({
        collection: 'assessment-submissions', // Corrected slug
        where: {
            user: { equals: user.id },
            assessment: { equals: assessmentId },
        },
        // limit: 0, // Removed limit: 0
        // count: true, // Removed count: true - use totalDocs from result
    })
    const attemptNumber = previousSubmissions.totalDocs + 1;

    if (assessment.maxAttempts > 0 && attemptNumber > assessment.maxAttempts) {
        return res.status(403).json({ message: `Maximum attempts (${assessment.maxAttempts}) reached for this assessment.` });
    }

    // 4. Create AssessmentSubmission record
    // Initial status - will be updated after grading if applicable
    let submissionStatus: 'submitted' | 'grading' | 'graded' = 'submitted';
    if (assessment.type === 'quiz') {
        // Default to grading, might change to graded if fully auto-gradable
        submissionStatus = 'grading';
    } else if (assessment.type === 'assignment') {
        submissionStatus = 'submitted'; // Assignments always need manual review initially
    }
    // Removed unused @ts-expect-error
    const newSubmission = await payload.create({
        collection: 'assessment-submissions', // Corrected slug
        data: {
            assessment: assessmentId,
            user: user.id,
            enrollment: enrollment.id,
            submittedAt: new Date().toISOString(),
            status: submissionStatus,
            answers: submissionData.answers, // Store raw answers for quizzes
            files: submissionData.files,     // Store file IDs for assignments
            attemptNumber: attemptNumber,
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

    // 5. Process Quiz Grading
    let score: number | null = null;
    let passed = false;
    let needsManualGrading = false; // Flag for text questions

    // Define an interface for option structure outside the loop
    interface QuestionOption { id: string; text: string; isCorrect?: boolean | null }
    // Define an interface for question structure (assuming Payload adds 'id' to array items)
    interface AssessmentQuestion { id: string; questionText: string; questionType: 'mcq' | 'scq' | 'text'; options?: QuestionOption[]; points?: number | null }

    if (assessment.type === 'quiz' && submissionData.answers && assessment.questions && Array.isArray(assessment.questions)) {
        let totalPointsAwarded = 0;
        let totalPossiblePoints = 0;

        for (const question of assessment.questions as AssessmentQuestion[]) { // Iterate through questions
            // Use question.id (Payload's auto-generated ID for array items) as the key
            const userAnswer = submissionData.answers[question.id];
            const questionPoints = question.points ?? 1;
            totalPossiblePoints += questionPoints;

            if (!question.id) {
                payload.logger.warn(`Grading: Skipping question without ID: ${question.questionText}`);
                continue; // Skip if question ID is missing for some reason
            }

            if (question.questionType === 'scq' || question.questionType === 'mcq') {
                // Ensure options exist and is an array
                if (!question.options || !Array.isArray(question.options)) {
                    payload.logger.warn(`Grading: Skipping question ${question.id} due to missing or invalid options.`);
                    continue;
                }

                // Ensure userAnswer is provided for grading this question type
                if (userAnswer == null) {
                    // No points if answer is missing
                    continue;
                }

                const correctOptions = question.options
                    .filter((opt: QuestionOption) => opt.isCorrect)
                    .map((opt: QuestionOption) => opt.text);

                if (question.questionType === 'scq') {
                    // Single choice: userAnswer should match the single correct option text
                    if (correctOptions.length === 1 && userAnswer === correctOptions[0]) {
                        totalPointsAwarded += questionPoints;
                    }
                } else { // mcq
                    // Multiple choice: userAnswer should be an array matching all correct option texts
                    if (Array.isArray(userAnswer) &&
                        userAnswer.length === correctOptions.length &&
                        userAnswer.every((ans: string) => correctOptions.includes(ans)) &&
                        correctOptions.every((correct: string) => userAnswer.includes(correct)))
                    {
                        totalPointsAwarded += questionPoints;
                    }
                }
            } else if (question.questionType === 'text') {
                needsManualGrading = true; // Mark for manual review
                // Skip auto-grading points for text questions
            }
        }

        // Calculate score percentage
        score = totalPossiblePoints > 0 ? Math.round((totalPointsAwarded / totalPossiblePoints) * 100) : 0;
        passed = score >= (assessment.passingScore ?? 70); // Use default 70 if not set

        // Determine final status
        submissionStatus = needsManualGrading ? 'grading' : 'graded';

        // Update submission status and score
        await payload.update({
            collection: 'assessment-submissions', // Corrected slug
            id: newSubmission.id,
            data: { status: submissionStatus, score },
        })
    }

    // --- Send 'assessment_graded' or 'assessment_needs_grading' Notification ---
    if (submissionStatus === 'graded') { // Only send 'graded' if fully auto-graded
        try {
            const serviceRegistry = ServiceRegistry.getInstance(payload)
            const notificationService = serviceRegistry.getNotificationService()
            await notificationService.sendNotification({
                userId: user.id,
                type: 'assessment_graded',
                title: `Assessment Graded: ${assessment.title}`, // Simplified title
                message: `Your submission for "${assessment.title}" has been graded. Score: ${score}%. ${passed ? 'You passed!' : 'Passing score not met.'}`, // Assumes score is not null here
                link: `/courses/${courseId}/learn/${lessonId}`, // Link back to the lesson
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
    } else if (submissionStatus === 'grading' || assessment.type === 'assignment') {
        // Send 'needs_grading' notification if manual review is required
        try {
            const serviceRegistry = ServiceRegistry.getInstance(payload)
            const notificationService = serviceRegistry.getNotificationService()
            await notificationService.sendNotification({
                userId: user.id,
                type: 'assessment_needs_grading', // New notification type
                title: `Assessment Submitted: ${assessment.title}`,
                message: `Your submission for "${assessment.title}" has been received and requires manual review. You will be notified when it's graded.`,
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
            payload.logger.error(`Failed to send assessment needs grading notification: ${notifError}`)
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
        status: submissionStatus, // Final status after grading attempt
        score: score, // Include score if calculated
        passed: passed, // Include pass status if calculated
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    payload.logger.error(`Error in submitHandler for assessment ${assessmentId}, user ${user.id}: ${message}`, error)
    return res.status(500).json({ message: 'An error occurred during assessment submission.' })
  }
}

// Export default
export default submitHandler;