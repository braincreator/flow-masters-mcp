import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Ensure params is awaited before accessing properties
    const userId = params?.id

    // Get payload client
    const payload = await getPayloadClient()

    // Get enrollment service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const enrollmentService = serviceRegistry.getEnrollmentService()

    // Get all courses the user has access to
    const courses = await enrollmentService.getUserCourses(userId)

    return NextResponse.json({ courses }, { status: 200 })
  } catch (error) {
    console.error('Error getting user courses:', error)
    return NextResponse.json(
      {
        courses: [],
        error: error instanceof Error ? error.message : 'Failed to get user courses',
      },
      { status: 500 },
    )
  }
}
