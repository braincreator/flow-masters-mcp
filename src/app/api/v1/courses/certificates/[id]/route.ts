import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const certificateId = params.id

    // Get payload client
    const payload = await getPayloadClient()

    // Find certificate by ID
    const certificates = await payload.find({
      collection: 'certificates',
      where: {
        certificateId: {
          equals: certificateId,
        },
      },
      depth: 1, // Include related fields
    })

    if (certificates.docs.length === 0) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    return NextResponse.json({ certificate: certificates.docs[0] }, { status: 200 })
  } catch (error) {
    console.error('Error getting certificate:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get certificate',
      },
      { status: 500 },
    )
  }
}
