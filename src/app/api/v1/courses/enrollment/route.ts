import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service.registry'

// Schema for enrollment update request
const updateProgressSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  progress: z.number().min(0).max(100),
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const courseId = url.searchParams.get('courseId')

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'User ID and Course ID are required' },
        { status: 400 }
      )
    }

    // Get payload client
    const payload = await getPayloadClient()
    
    // Find enrollment
    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          {
            user: {
              equals: userId,
            },
          },
          {
            course: {
              equals: courseId,
            },
          },
        ],
      },
      limit: 1,
    })

    if (enrollments.docs.length === 0) {
      return NextResponse.json({ enrollment: null }, { status: 200 })
    }

    return NextResponse.json({ enrollment: enrollments.docs[0] }, { status: 200 })
  } catch (error) {
    console.error('Error getting course enrollment:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get course enrollment' 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Parse and validate request
    const body = await req.json()
    const { userId, courseId, progress } = updateProgressSchema.parse(body)

    // Get payload client
    const payload = await getPayloadClient()
    
    // Get enrollment service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const enrollmentService = serviceRegistry.getEnrollmentService()

    // Update course progress
    const updatedEnrollment = await enrollmentService.updateCourseProgress(userId, courseId, progress)

    return NextResponse.json({ success: true, enrollment: updatedEnrollment }, { status: 200 })
  } catch (error) {
    console.error('Error updating course progress:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update course progress' 
      }, 
      { status: 500 }
    )
  }
}
