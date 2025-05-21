import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../../helpers/auth'
import { z } from 'zod'
import { addDays } from 'date-fns'

// Validation schema for request parameters
const requestBodySchema = z.object({
  templateId: z.string().uuid({ message: 'Invalid template ID format' }),
  projectId: z.string().uuid({ message: 'Invalid project ID format' }),
  startDate: z.string().optional(), // ISO date string
})

/**
 * POST handler for applying a template to a project
 * Admin-only endpoint
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = user.roles?.includes('admin')
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      }, { status: 403 })
    }

    // Parse and validate request body
    const body = await req.json()
    
    let validatedBody
    try {
      validatedBody = requestBodySchema.parse(body)
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Fetch the template
    const template = await payload.findByID({
      collection: 'project-templates',
      id: validatedBody.templateId,
    })

    if (!template) {
      return NextResponse.json({
        success: false,
        error: 'Template not found'
      }, { status: 404 })
    }

    // Fetch the project
    const project = await payload.findByID({
      collection: 'service-projects',
      id: validatedBody.projectId,
    })

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 })
    }

    // Determine start date
    const startDate = validatedBody.startDate 
      ? new Date(validatedBody.startDate) 
      : new Date()

    // Create milestones from template
    const createdMilestones = []
    const milestoneDates = {} // To track milestone dates for dependencies

    // Sort milestones by order
    const sortedMilestones = [...template.milestones].sort((a, b) => a.order - b.order)

    // First pass: Create milestones without dependencies
    for (const templateMilestone of sortedMilestones) {
      let milestoneDate = new Date(startDate)
      
      // If this milestone depends on others, calculate its date in the second pass
      if (!templateMilestone.dependsOn || templateMilestone.dependsOn.length === 0) {
        // Calculate milestone date based on duration
        const durationValue = templateMilestone.estimatedDuration.value
        const durationUnit = templateMilestone.estimatedDuration.unit
        
        // Convert duration to days
        let durationDays = durationValue
        if (durationUnit === 'weeks') {
          durationDays = durationValue * 7
        } else if (durationUnit === 'months') {
          durationDays = durationValue * 30 // Approximation
        }
        
        // Create milestone
        const milestone = await payload.create({
          collection: 'project-milestones',
          data: {
            title: templateMilestone.title,
            description: templateMilestone.description,
            project: validatedBody.projectId,
            status: 'not_started',
            dueDate: addDays(milestoneDate, durationDays).toISOString(),
            requiresClientApproval: templateMilestone.requiresClientApproval,
          },
        })
        
        createdMilestones.push(milestone)
        milestoneDates[templateMilestone.order] = milestone.dueDate
      }
    }
    
    // Second pass: Create milestones with dependencies
    for (const templateMilestone of sortedMilestones) {
      if (templateMilestone.dependsOn && templateMilestone.dependsOn.length > 0) {
        // Find the latest dependent milestone date
        let latestDependentDate = new Date(startDate)
        
        for (const dependency of templateMilestone.dependsOn) {
          const dependentMilestoneDate = milestoneDates[dependency.milestoneOrder]
          
          if (dependentMilestoneDate) {
            const dependentDate = new Date(dependentMilestoneDate)
            // Add offset days
            const offsetDate = addDays(dependentDate, dependency.offsetDays || 0)
            
            if (offsetDate > latestDependentDate) {
              latestDependentDate = offsetDate
            }
          }
        }
        
        // Calculate milestone date based on duration
        const durationValue = templateMilestone.estimatedDuration.value
        const durationUnit = templateMilestone.estimatedDuration.unit
        
        // Convert duration to days
        let durationDays = durationValue
        if (durationUnit === 'weeks') {
          durationDays = durationValue * 7
        } else if (durationUnit === 'months') {
          durationDays = durationValue * 30 // Approximation
        }
        
        // Create milestone
        const milestone = await payload.create({
          collection: 'project-milestones',
          data: {
            title: templateMilestone.title,
            description: templateMilestone.description,
            project: validatedBody.projectId,
            status: 'not_started',
            dueDate: addDays(latestDependentDate, durationDays).toISOString(),
            requiresClientApproval: templateMilestone.requiresClientApproval,
          },
        })
        
        createdMilestones.push(milestone)
        milestoneDates[templateMilestone.order] = milestone.dueDate
      }
    }
    
    // Create tasks from template
    const createdTasks = []
    
    for (const templateTask of template.tasks || []) {
      // Find the related milestone
      const relatedMilestone = createdMilestones.find((m, index) => {
        const templateMilestone = sortedMilestones[index]
        return templateMilestone.order === templateTask.relatedMilestoneOrder
      })
      
      if (relatedMilestone) {
        // Create task
        const task = await payload.create({
          collection: 'tasks',
          data: {
            title: templateTask.title,
            description: templateTask.description,
            project: validatedBody.projectId,
            status: 'not_started',
            estimatedHours: templateTask.estimatedHours,
            assigneeRole: templateTask.assigneeRole,
          },
        })
        
        createdTasks.push(task)
      }
    }
    
    // Update project with template information
    await payload.update({
      collection: 'service-projects',
      id: validatedBody.projectId,
      data: {
        appliedTemplate: validatedBody.templateId,
        // Add any other template-related fields to the project
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        milestones: createdMilestones,
        tasks: createdTasks,
      },
      message: 'Template applied successfully',
    })
  } catch (error) {
    console.error('Error applying template to project:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to apply template to project',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
