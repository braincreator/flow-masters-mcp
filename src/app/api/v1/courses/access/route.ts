import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Schema for access check request
const accessCheckSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
})

export async function POST(req: Request) {
  try {
    // Parse and validate request
    const body = await req.json()
    const { userId, courseId } = accessCheckSchema.parse(body)

    // Get payload client
    const payload = await getPayloadClient()

    // Get enrollment service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const enrollmentService = serviceRegistry.getEnrollmentService()

    // Check if user has access to course
    const hasAccess = await enrollmentService.hasAccessToCourse(userId, courseId)

    return NextResponse.json({ hasAccess }, { status: 200 })
  } catch (error) {
    logError('Error checking course access:', error)
    return NextResponse.json(
      {
        hasAccess: false,
        error: error instanceof Error ? error.message : 'Failed to check course access',
      },
      { status: 500 },
    )
  }
}
