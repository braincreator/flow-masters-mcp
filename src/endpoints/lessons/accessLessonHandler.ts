import { PayloadRequest } from 'payload'; // Trying direct import from 'payload'
import { Response } from 'express';
import { addDays, parseISO, isBefore, isEqual } from 'date-fns';
import { Lesson, CourseEnrollment, User } from '../../payload-types'; // Generated types

// Removed unused 'payload' import

export const accessLessonHandler = async (req: PayloadRequest, res: Response): Promise<Response> => {
  // The 'req.user' object should be automatically typed based on Payload config
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No user logged in.' });
  }

  const { lessonId } = req.params;
  if (!lessonId) {
    return res.status(400).json({ message: 'Bad Request: Missing lessonId parameter.' });
  }

  try {
    // Fetch the lesson, ensuring module and course data are populated
    // Depth 2: Lesson -> Module -> Course
    const lesson = await req.payload.findByID<Lesson>({
      collection: 'lessons',
      id: lessonId,
      depth: 2, // Ensure module and course are populated
      user: req.user, // Pass user for potential access control in findByID hooks
      overrideAccess: false, // Apply standard access control
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    // Admin bypass
    if (req.user.role === 'admin') {
      console.log(`Admin access granted for lesson ${lessonId}`);
      // Return specific fields if needed, e.g., lesson.layout
      return res.status(200).json(lesson);
    }

    // Access Check Logic
    const { dripType, dripDelayDays, availableOn } = lesson;
    const now = new Date();
    let accessGranted = false;

    switch (dripType) {
      case 'immediate':
        accessGranted = true;
        console.log(`Immediate access granted for lesson ${lessonId}`);
        break;

      case 'specificDate':
        if (availableOn) {
          const availableDate = parseISO(availableOn);
          if (isBefore(availableDate, now) || isEqual(availableDate, now)) {
            accessGranted = true;
            console.log(`Specific date access granted for lesson ${lessonId}`);
          } else {
             console.log(`Specific date access denied for lesson ${lessonId}. Available on: ${availableOn}`);
          }
        } else {
             console.log(`Specific date access denied for lesson ${lessonId}. No availableOn date set.`);
        }
        break;

      case 'daysAfterEnrollment':
        // Ensure module and course are correctly populated
        const courseId = typeof lesson.module === 'object' && lesson.module !== null && typeof lesson.module.course === 'object' && lesson.module.course !== null
          ? lesson.module.course.id
          : null;

        if (!courseId) {
          console.error(`Could not determine course ID for lesson ${lessonId}. Module or Course data missing.`);
          return res.status(500).json({ message: 'Internal Server Error: Course data missing.' });
        }

        try {
          // Find the user's active enrollment for this course
          const enrollments = await req.payload.find<CourseEnrollment>({
            collection: 'course-enrollments',
            where: {
              and: [
                { 'student.equals': req.user.id },
                { 'course.equals': courseId },
                { 'status.equals': 'active' }, // Ensure enrollment is active
              ],
            },
            limit: 1, // We only need one active enrollment
            depth: 0, // No need for further depth here
            user: req.user,
            overrideAccess: true, // Need to bypass default access to check enrollment date
          });

          if (enrollments.docs.length > 0 && enrollments.docs[0].enrolledAt) {
            const enrollment = enrollments.docs[0];
            const enrollmentDate = parseISO(enrollment.enrolledAt);
            const calculatedAvailableDate = addDays(enrollmentDate, dripDelayDays ?? 0);

            if (isBefore(calculatedAvailableDate, now) || isEqual(calculatedAvailableDate, now)) {
              accessGranted = true;
              console.log(`Days after enrollment access granted for lesson ${lessonId}. Available since: ${calculatedAvailableDate.toISOString()}`);
            } else {
               console.log(`Days after enrollment access denied for lesson ${lessonId}. Available on: ${calculatedAvailableDate.toISOString()}`);
            }
          } else {
             console.log(`Days after enrollment access denied for lesson ${lessonId}. No active enrollment found for course ${courseId}.`);
          }
        } catch (enrollmentError) {
          console.error(`Error fetching enrollment for user ${req.user.id}, course ${courseId}:`, enrollmentError);
          return res.status(500).json({ message: 'Internal Server Error checking enrollment.' });
        }
        break;

      default:
        console.log(`Access denied for lesson ${lessonId}. Unknown or unsupported dripType: ${dripType}`);
        break; // Access denied by default
    }

    if (accessGranted) {
      // Return specific fields if needed, e.g., lesson.layout
      return res.status(200).json(lesson);
    } else {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this lesson at this time.' });
    }

  } catch (error) {
    console.error(`Error accessing lesson ${lessonId}:`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};