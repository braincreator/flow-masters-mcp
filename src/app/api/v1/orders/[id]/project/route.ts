import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/utilities/auth/getServerSession'

/**
 * GET /api/v1/orders/:id/project
 * Get the service project associated with an order
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // First, check if the user has access to the order
    const order = await payload.findByID({
      collection: 'orders',
      id,
      where: {
        customer: {
          equals: session.user.id,
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 })
    }

    // Find the service project associated with this order
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        sourceOrder: {
          equals: id,
        },
      },
      limit: 1,
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'No project found for this order' }, { status: 404 })
    }

    const project = projectResponse.docs[0]

    return NextResponse.json({
      success: true,
      projectId: project.id,
      projectName: project.name,
      projectStatus: project.status,
    })
  } catch (error) {
    console.error('Error fetching project for order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
