import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service.registry'

// Schema for enrollment request
const enrollmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  source: z.enum(['purchase', 'admin', 'promotion', 'subscription']).optional(),
  orderId: z.string().optional(),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    // Parse and validate request
    const body = await req.json()
    const enrollmentData = enrollmentSchema.parse(body)

    // Get payload client
    const payload = await getPayloadClient()
    
    // Get enrollment service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const enrollmentService = serviceRegistry.getEnrollmentService()

    // Enroll user in course
    const enrollment = await enrollmentService.enrollUserInCourse({
      userId: enrollmentData.userId,
      courseId: enrollmentData.courseId,
      source: enrollmentData.source,
      orderId: enrollmentData.orderId,
      expiresAt: enrollmentData.expiresAt,
      notes: enrollmentData.notes,
    })

    return NextResponse.json({ success: true, enrollment }, { status: 200 })
  } catch (error) {
    console.error('Error enrolling user in course:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to enroll user in course' 
      }, 
      { status: 500 }
    )
  }
}
