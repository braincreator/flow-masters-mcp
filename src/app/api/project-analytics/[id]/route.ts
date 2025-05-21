import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../../helpers/auth'
import { addDays, format, parseISO, differenceInDays, startOfWeek, endOfWeek, subMonths } from 'date-fns'
import { z } from 'zod'

// Validation schema for request parameters
const requestParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid project ID format' }),
  timeframe: z.enum(['week', 'month', 'all'], {
    invalid_type_error: 'Timeframe must be one of: week, month, all',
    required_error: 'Timeframe is required'
  }).default('month')
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate and parse request parameters
    const url = new URL(req.url)
    const timeframeParam = url.searchParams.get('timeframe') || 'month'

    let validatedId: string;
    let timeframe: 'week' | 'month' | 'all';

    try {
      const validated = requestParamsSchema.parse({
        id: params.id,
        timeframe: timeframeParam
      });
      validatedId = validated.id;
      timeframe = validated.timeframe;
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Check if user has access to the project
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: {
          equals: id,
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
      depth: 1,
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    const project = projectResponse.docs[0]

    // Get project milestones
    const milestonesResponse = await payload.find({
      collection: 'project-milestones',
      where: {
        project: {
          equals: id,
        },
      },
      sort: 'order',
      depth: 1,
    })

    const milestones = milestonesResponse.docs

    // Get project messages
    const messagesResponse = await payload.find({
      collection: 'project-messages',
      where: {
        project: {
          equals: id,
        },
      },
      sort: 'createdAt',
      depth: 1,
    })

    const messages = messagesResponse.docs

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date(project.createdAt)

    if (timeframe === 'week') {
      startDate = new Date(Math.max(startDate.getTime(), addDays(now, -7).getTime()))
    } else if (timeframe === 'month') {
      startDate = new Date(Math.max(startDate.getTime(), subMonths(now, 1).getTime()))
    }

    // Calculate milestone statistics
    const milestoneStats = {
      total: milestones.length,
      completed: milestones.filter(m => m.status === 'completed').length,
      inProgress: milestones.filter(m => m.status === 'in_progress').length,
      planned: milestones.filter(m => m.status === 'planned').length,
      delayed: milestones.filter(m => m.status === 'delayed').length,
    }

    // Calculate completion percentage
    const completionPercentage = milestones.length > 0
      ? Math.round((milestoneStats.completed / milestoneStats.total) * 100)
      : 0

    // Calculate estimated end date (if not completed)
    let estimatedEndDate = null
    const lastMilestone = milestones.length > 0
      ? milestones.reduce((latest, milestone) => {
          if (!milestone.dueDate) return latest
          return !latest || new Date(milestone.dueDate) > new Date(latest.dueDate)
            ? milestone
            : latest
        }, null as any)
      : null

    if (lastMilestone && lastMilestone.dueDate) {
      estimatedEndDate = lastMilestone.dueDate
    }

    // Prepare milestone timeline data
    const milestoneTimeline = milestones.map(milestone => {
      const onTime = milestone.status === 'completed' && milestone.dueDate && milestone.completedAt
        ? new Date(milestone.completedAt) <= new Date(milestone.dueDate)
        : true

      return {
        id: milestone.id,
        title: milestone.title,
        status: milestone.status,
        dueDate: milestone.dueDate,
        completedAt: milestone.completedAt,
        onTime,
      }
    })

    // Calculate time to milestone data
    const timeToMilestone = milestones
      .filter(milestone => milestone.status === 'completed' && milestone.completedAt && milestone.dueDate)
      .map(milestone => {
        const createdAt = new Date(project.createdAt)
        const dueDate = new Date(milestone.dueDate)
        const completedAt = new Date(milestone.completedAt)

        const plannedDays = differenceInDays(dueDate, createdAt)
        const actualDays = differenceInDays(completedAt, createdAt)

        return {
          milestone: milestone.title,
          plannedDays,
          actualDays,
        }
      })

    // Group activity by week
    const activityByWeek = []
    let currentDate = new Date(startDate)

    while (currentDate <= now) {
      const weekStart = startOfWeek(currentDate)
      const weekEnd = endOfWeek(currentDate)
      const weekLabel = format(weekStart, 'MMM d')

      const weekMessages = messages.filter(msg => {
        const msgDate = new Date(msg.createdAt)
        return msgDate >= weekStart && msgDate <= weekEnd
      }).length

      const weekMilestones = milestones.filter(milestone => {
        if (milestone.completedAt) {
          const completedDate = new Date(milestone.completedAt)
          return completedDate >= weekStart && completedDate <= weekEnd
        }
        return false
      }).length

      // Count files from messages in this week
      const weekFiles = messages.filter(msg => {
        const msgDate = new Date(msg.createdAt)
        return msgDate >= weekStart && msgDate <= weekEnd && msg.attachments && msg.attachments.length > 0
      }).reduce((count, msg) => count + (msg.attachments ? msg.attachments.length : 0), 0)

      activityByWeek.push({
        week: weekLabel,
        messages: weekMessages,
        milestones: weekMilestones,
        files: weekFiles,
      })

      // Move to next week
      currentDate = addDays(currentDate, 7)
    }

    // Prepare response
    const analytics = {
      projectId: project.id,
      projectName: project.name,
      startDate: project.createdAt,
      estimatedEndDate,
      actualEndDate: project.status === 'completed' ? project.updatedAt : null,
      currentStatus: project.status,
      completionPercentage,
      milestoneStats,
      milestoneTimeline,
      activityByWeek,
      timeToMilestone,
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error generating project analytics:', error)

    // Determine the appropriate error response
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    } else if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 404 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to generate project analytics',
        message: error.message
      }, { status: 500 })
    }

    // Generic error fallback
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
