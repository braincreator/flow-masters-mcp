import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../../helpers/auth'
import { z } from 'zod'
import ical from 'ical-generator'
import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'

// Validation schema for request parameters
const requestParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid project ID format' }),
  format: z.enum(['json', 'ical']).default('json'),
  includeCompleted: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
  timeZone: z.string().default('UTC'),
})

/**
 * GET handler for project calendar events
 * Supports JSON and iCal formats
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate and parse request parameters
    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'json'
    const includeCompleted = url.searchParams.get('includeCompleted') || 'false'
    const timeZone = url.searchParams.get('timeZone') || 'UTC'
    
    let validatedParams
    try {
      validatedParams = requestParamsSchema.parse({
        id: params.id,
        format,
        includeCompleted,
        timeZone,
      })
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Check if user has access to the project
    const project = await payload.findByID({
      collection: 'service-projects',
      id: validatedParams.id,
    })

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 })
    }

    // Check if user is admin or project customer
    const isAdmin = user.roles?.includes('admin')
    const isCustomer = project.customer === user.id
    
    if (!isAdmin && !isCustomer) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }

    // Build query for milestones
    const query: any = {
      where: {
        project: {
          equals: validatedParams.id,
        },
      },
      sort: 'dueDate',
    }

    // Filter out completed milestones if not requested
    if (!validatedParams.includeCompleted) {
      query.where.status = {
        not_equals: 'completed',
      }
    }

    // Fetch project milestones
    const milestonesResponse = await payload.find({
      collection: 'project-milestones',
      ...query,
    })

    const milestones = milestonesResponse.docs

    // Determine user's locale for date formatting
    const locale = user.locale === 'ru' ? ru : enUS

    // Format milestones as calendar events
    const events = milestones.map(milestone => {
      const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null
      const completedDate = milestone.completedAt ? new Date(milestone.completedAt) : null
      
      // Format dates for display
      const formattedDueDate = dueDate 
        ? format(dueDate, 'PPP', { locale })
        : null
      
      const formattedCompletedDate = completedDate
        ? format(completedDate, 'PPP', { locale })
        : null

      return {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        dueDate: milestone.dueDate,
        formattedDueDate,
        completedAt: milestone.completedAt,
        formattedCompletedDate,
        projectId: project.id,
        projectName: project.name,
      }
    })

    // Return events in requested format
    if (validatedParams.format === 'ical') {
      // Create iCal calendar
      const calendar = ical({
        name: `${project.name} - Milestones`,
        timezone: validatedParams.timeZone,
        prodId: { company: 'Flow Masters', product: 'Project Calendar' },
      })

      // Add events to calendar
      events.forEach(event => {
        if (!event.dueDate) return // Skip events without due date
        
        const dueDate = new Date(event.dueDate)
        
        // Create event end date (due date + 1 hour)
        const endDate = new Date(dueDate)
        endDate.setHours(endDate.getHours() + 1)
        
        // Create event summary based on locale
        const summary = user.locale === 'ru'
          ? `Этап проекта: ${event.title}`
          : `Project Milestone: ${event.title}`
        
        // Create event description based on locale
        const description = user.locale === 'ru'
          ? `Этап проекта "${project.name}"\n\nСтатус: ${getStatusRu(event.status)}\n\n${event.description || ''}`
          : `Project "${project.name}" milestone\n\nStatus: ${getStatusEn(event.status)}\n\n${event.description || ''}`
        
        // Add event to calendar
        calendar.createEvent({
          id: event.id,
          start: dueDate,
          end: endDate,
          summary,
          description,
          location: 'Flow Masters',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/projects/${project.id}?tab=milestones`,
          status: event.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE',
        })
      })

      // Generate iCal string
      const icalString = calendar.toString()
      
      // Return as attachment
      return new NextResponse(icalString, {
        headers: {
          'Content-Type': 'text/calendar',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(project.name)}-milestones.ics"`,
        },
      })
    } else {
      // Return JSON response
      return NextResponse.json({
        success: true,
        data: {
          project: {
            id: project.id,
            name: project.name,
          },
          events,
        },
      })
    }
  } catch (error) {
    console.error('Error generating project calendar:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate project calendar',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

/**
 * Get localized status for Russian
 */
function getStatusRu(status: string): string {
  switch (status) {
    case 'not_started':
      return 'Не начат'
    case 'in_progress':
      return 'В процессе'
    case 'completed':
      return 'Завершен'
    case 'delayed':
      return 'Отложен'
    case 'blocked':
      return 'Заблокирован'
    default:
      return status
  }
}

/**
 * Get localized status for English
 */
function getStatusEn(status: string): string {
  switch (status) {
    case 'not_started':
      return 'Not Started'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'delayed':
      return 'Delayed'
    case 'blocked':
      return 'Blocked'
    default:
      return status
  }
}
