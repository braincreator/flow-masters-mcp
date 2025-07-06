import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/utilities/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// GET handler to fetch project feedback
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const milestoneId = searchParams.get('milestoneId')
    const feedbackType = searchParams.get('feedbackType')
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    
    // Build the query
    const query: any = {
      project: {
        equals: projectId,
      },
    }
    
    if (milestoneId) {
      query.milestone = {
        equals: milestoneId,
      }
    }
    
    if (feedbackType) {
      query.feedbackType = {
        equals: feedbackType,
      }
    }
    
    // Fetch feedback
    const { docs: feedback } = await payload.find({
      collection: 'project-feedback',
      where: query,
      sort: '-createdAt',
    })
    
    return NextResponse.json(feedback)
  } catch (error) {
    logError('Error fetching project feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch project feedback' }, { status: 500 })
  }
}

// POST handler to create new feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { projectId, milestoneId, feedbackType, rating, aspectRatings, comment } = body
    
    if (!projectId || !feedbackType || !rating) {
      return NextResponse.json({ 
        error: 'Project ID, feedback type, and rating are required' 
      }, { status: 400 })
    }
    
    // Create feedback
    const feedbackData: any = {
      project: projectId,
      feedbackType,
      rating,
      comment,
      submittedBy: session.user.id,
    }
    
    if (milestoneId) {
      feedbackData.milestone = milestoneId
    }
    
    if (aspectRatings) {
      feedbackData.aspectRatings = aspectRatings
    }
    
    const feedback = await payload.create({
      collection: 'project-feedback',
      data: feedbackData,
    })
    
    return NextResponse.json(feedback)
  } catch (error) {
    logError('Error creating project feedback:', error)
    return NextResponse.json({ error: 'Failed to create project feedback' }, { status: 500 })
  }
}
