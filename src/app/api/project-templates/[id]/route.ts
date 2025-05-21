import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../../helpers/auth'
import { z } from 'zod'

// Validation schema for request parameters
const requestParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid template ID format' }),
})

/**
 * GET handler for fetching a specific project template
 * Admin-only endpoint
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing its properties
    const { id } = await params

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

    // Validate and parse request parameters
    let validatedId: string
    try {
      const validated = requestParamsSchema.parse({
        id,
      })
      validatedId = validated.id
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
      id: validatedId,
    })

    if (!template) {
      return NextResponse.json({
        success: false,
        error: 'Template not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Error fetching project template:', error)

    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch project template',
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
 * PUT handler for updating a project template
 * Admin-only endpoint
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing its properties
    const { id } = await params

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

    // Validate and parse request parameters
    let validatedId: string
    try {
      const validated = requestParamsSchema.parse({
        id,
      })
      validatedId = validated.id
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Parse request body
    const body = await req.json()

    // Update the template
    const template = await payload.update({
      collection: 'project-templates',
      id: validatedId,
      data: body,
    })

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Error updating project template:', error)

    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update project template',
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
 * DELETE handler for deleting a project template
 * Admin-only endpoint
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing its properties
    const { id } = await params

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

    // Validate and parse request parameters
    let validatedId: string
    try {
      const validated = requestParamsSchema.parse({
        id,
      })
      validatedId = validated.id
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Delete the template
    await payload.delete({
      collection: 'project-templates',
      id: validatedId,
    })

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting project template:', error)

    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete project template',
        message: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}