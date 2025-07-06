import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/utilities/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// GET handler to fetch a specific feedback item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const feedback = await payload.findByID({
      collection: 'project-feedback',
      id,
    })
    
    return NextResponse.json(feedback)
  } catch (error) {
    logError('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

// PATCH handler to update a feedback item
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = params
    const body = await req.json()
    
    // Check if user is admin
    const isAdmin = session.user.roles?.includes('admin')
    
    if (!isAdmin) {
      // Check if the feedback belongs to the user
      const existingFeedback = await payload.findByID({
        collection: 'project-feedback',
        id,
      })
      
      if (existingFeedback.submittedBy !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }
    
    const feedback = await payload.update({
      collection: 'project-feedback',
      id,
      data: body,
    })
    
    return NextResponse.json(feedback)
  } catch (error) {
    logError('Error updating feedback:', error)
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}

// DELETE handler to delete a feedback item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = params
    
    // Only admins can delete feedback
    const isAdmin = session.user.roles?.includes('admin')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    await payload.delete({
      collection: 'project-feedback',
      id,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Error deleting feedback:', error)
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 })
  }
}
