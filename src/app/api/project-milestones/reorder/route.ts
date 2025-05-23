import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '../../helpers/auth'
import { getPayloadClient } from '@/utilities/payload/index'

// Reorder milestones
export async function PATCH(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { milestoneIds } = await req.json()

    if (!milestoneIds || !Array.isArray(milestoneIds)) {
      return NextResponse.json({ error: 'Invalid milestone IDs' }, { status: 400 })
    }

    // Get the Payload client
    const payload = await getPayloadClient()

    // Update the order of each milestone
    const updatePromises = milestoneIds.map((id: string, index: number) =>
      payload.update({
        collection: 'project-milestones',
        id,
        data: {
          order: index,
        },
      }),
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering milestones:', error)
    return NextResponse.json({ error: 'Failed to reorder milestones' }, { status: 500 })
  }
}
