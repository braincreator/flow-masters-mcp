import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

// Schema for certificate generation request
const certificateRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
})

export async function POST(req: Request) {
  try {
    // Parse and validate request
    const body = await req.json()
    const { userId, courseId } = certificateRequestSchema.parse(body)

    // Get payload client
    const payload = await getPayloadClient()

    // Get enrollment service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const enrollmentService = serviceRegistry.getEnrollmentService()

    // Generate certificate
    const certificate = await enrollmentService.generateCertificate(userId, courseId)

    return NextResponse.json({ success: true, certificate }, { status: 200 })
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate certificate',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get payload client
    const payload = await getPayloadClient()

    // Get enrollment service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const enrollmentService = serviceRegistry.getEnrollmentService()

    // Get user certificates
    const certificates = await enrollmentService.getUserCertificates(userId)

    return NextResponse.json({ certificates }, { status: 200 })
  } catch (error) {
    console.error('Error getting certificates:', error)
    return NextResponse.json(
      {
        certificates: [],
        error: error instanceof Error ? error.message : 'Failed to get certificates',
      },
      { status: 500 },
    )
  }
}
