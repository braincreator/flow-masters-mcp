import { NextResponse, NextRequest } from 'next/server'
// Note: Linter might still incorrectly flag getPayloadClient import, assuming path is correct.
import { getPayloadClient } from '@/utilities/payload/index'
import { EnrollmentService, EnrollmentData } from '@/services/courses/enrollmentService'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import type { User, Course } from '@/payload-types' // Import Course type

// Removed dummy getUserFromRequest function

export async function POST(request: NextRequest) {
  let payload
  try {
    payload = await getPayloadClient()
  } catch (error) {
    logError('Failed to get Payload client:', error)
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  // Ensure payload is defined before proceeding
  if (!payload) {
     return NextResponse.json({ error: 'Payload client initialization failed' }, { status: 500 })
  }

  const enrollmentService = new EnrollmentService(payload)

  try {
    // 1. Authenticate User using Payload's server-side auth function
    // Try calling without req, assuming Payload handles Next.js context
    const { user } = await payload.auth()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get courseId from request body
    const body = await request.json()
    const { courseId } = body

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid courseId' }, { status: 400 })
    }

    // 3. Verify the course is actually free
    // Fetch course using collection slug and return type as arguments
    const courseResult = await payload.findByID<'courses', Course>({ // Add Course type
      collection: 'courses',
      id: courseId,
      depth: 0, // Keep depth 0 if only accessType is needed
    })

    // Check if course exists *before* accessing its properties
    if (!courseResult) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Cast the result to Course to access properties like accessType
    const course = courseResult as Course;
    if (course.accessType !== 'free') {
      return NextResponse.json({ error: 'Course is not free' }, { status: 403 })
    }

    // 4. Enroll the user - Explicitly define the object structure
    const enrollmentInput: EnrollmentData = {
      userId: user.id,
      courseId: courseId,
      source: 'promotion', // Use 'promotion' as a valid source for free enrollment
    }
    const enrollment = await enrollmentService.enrollUserInCourse(enrollmentInput)

    return NextResponse.json({ success: true, enrollmentId: enrollment.id }, { status: 200 })

  } catch (error: any) {
    logError('API Error enrolling user (free):', error)
    const errorMessage = error.message || 'Failed to enroll in the course.'
    const statusCode = typeof error === 'object' && error !== null && 'status' in error ? error.status : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}