import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '../../helpers/auth'
import { getPayloadClient } from '@/utilities/payload/index'

// Update milestone
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const milestoneId = params.id
    const updateData = await req.json()

    // Get the Payload client
    const payload = await getPayloadClient()

    // Check if user has access to this milestone
    const milestone = await payload.findByID({
      collection: 'project-milestones',
      id: milestoneId,
      depth: 1,
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    // Check project access
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: {
          equals: typeof milestone.project === 'string' ? milestone.project : milestone.project.id,
        },
        or: [
          {
            'customer.id': {
              equals: user.id,
            },
          },
          {
            'assignedTo.id': {
              equals: user.id,
            },
          },
        ],
      },
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update milestone
    const updatedMilestone = await payload.update({
      collection: 'project-milestones',
      id: milestoneId,
      data: {
        ...updateData,
        updatedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json(updatedMilestone)
  } catch (error) {
    console.error('Error updating milestone:', error)
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
  }
}

// Delete milestone
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const milestoneId = params.id

    // Get the Payload client
    const payload = await getPayloadClient()

    // Check if user has access to this milestone
    const milestone = await payload.findByID({
      collection: 'project-milestones',
      id: milestoneId,
      depth: 1,
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    // Check project access
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: {
          equals: typeof milestone.project === 'string' ? milestone.project : milestone.project.id,
        },
        or: [
          {
            'customer.id': {
              equals: user.id,
            },
          },
          {
            'assignedTo.id': {
              equals: user.id,
            },
          },
        ],
      },
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete milestone
    await payload.delete({
      collection: 'project-milestones',
      id: milestoneId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting milestone:', error)
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 })
  }
}
