import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../helpers/auth'
import { z } from 'zod'

// Validation schema for request parameters
const requestParamsSchema = z.object({
  category: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
})

/**
 * GET handler for fetching project templates
 * Admin-only endpoint
 */
export async function GET(req: NextRequest) {
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

    // Parse and validate query parameters
    const url = new URL(req.url)
    const queryParams = {
      category: url.searchParams.get('category') || undefined,
      isActive: url.searchParams.get('isActive') || undefined,
      search: url.searchParams.get('search') || undefined,
      limit: url.searchParams.get('limit') || '10',
      page: url.searchParams.get('page') || '1',
    }

    let validatedParams
    try {
      validatedParams = requestParamsSchema.parse(queryParams)
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Build query
    const query: any = {
      limit: validatedParams.limit,
      page: validatedParams.page,
      sort: '-createdAt', // Sort by most recent first
      where: {},
    }

    // Add filters if provided
    if (validatedParams.category) {
      query.where.category = {
        equals: validatedParams.category,
      }
    }

    if (validatedParams.isActive !== undefined) {
      query.where.isActive = {
        equals: validatedParams.isActive,
      }
    }

    // Add search if provided
    if (validatedParams.search) {
      query.where.name = {
        like: validatedParams.search,
      }
    }

    // Fetch templates
    const templates = await payload.find({
      collection: 'project-templates',
      ...query,
    })

    return NextResponse.json({
      success: true,
      data: templates.docs,
      totalDocs: templates.totalDocs,
      totalPages: templates.totalPages,
      page: templates.page,
      hasNextPage: templates.hasNextPage,
      hasPrevPage: templates.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching project templates:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch project templates',
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
 * POST handler for creating a new project template
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

    // Parse request body
    const body = await req.json()

    // Create template
    const template = await payload.create({
      collection: 'project-templates',
      data: {
        ...body,
        createdBy: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Error creating project template:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create project template',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
