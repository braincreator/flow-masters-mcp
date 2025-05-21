import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../helpers/auth'
import { z } from 'zod'

// Validation schema for request parameters
const requestParamsSchema = z.object({
  projectId: z.string().optional(),
  reportType: z.enum(['weekly', 'monthly', 'milestone', 'custom']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
})

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate query parameters
    const url = new URL(req.url)
    const queryParams = {
      projectId: url.searchParams.get('projectId') || undefined,
      reportType: url.searchParams.get('reportType') as any || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
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

    // If user is not an admin, restrict to their projects
    if (!user.roles?.includes('admin')) {
      query.where = {
        'project.customer': {
          equals: user.id,
        },
      }
    }

    // Add filters if provided
    if (validatedParams.projectId) {
      query.where.project = {
        equals: validatedParams.projectId,
      }
    }

    if (validatedParams.reportType) {
      query.where.reportType = {
        equals: validatedParams.reportType,
      }
    }

    // Date range filter
    if (validatedParams.startDate || validatedParams.endDate) {
      query.where.createdAt = {}

      if (validatedParams.startDate) {
        query.where.createdAt.greater_than_equal = validatedParams.startDate
      }

      if (validatedParams.endDate) {
        query.where.createdAt.less_than_equal = validatedParams.endDate
      }
    }

    // Fetch reports
    const reports = await payload.find({
      collection: 'project-reports',
      ...query,
      depth: 1, // Include basic relationship data
    })

    return NextResponse.json({
      success: true,
      data: reports.docs,
      totalDocs: reports.totalDocs,
      totalPages: reports.totalPages,
      page: reports.page,
      hasNextPage: reports.hasNextPage,
      hasPrevPage: reports.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching project reports:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch project reports',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
