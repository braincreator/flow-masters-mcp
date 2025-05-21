import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../../../helpers/auth'
import { z } from 'zod'

// Validation schema for request parameters
const requestParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid report ID format' }),
  format: z.enum(['pdf', 'json']).default('pdf'),
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
    const format = url.searchParams.get('format') || 'pdf'
    
    let validatedParams
    try {
      validatedParams = requestParamsSchema.parse({
        id: params.id,
        format,
      })
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      }, { status: 400 })
    }

    // Fetch the report
    let report
    try {
      // If user is admin, they can access any report
      if (user.roles?.includes('admin')) {
        report = await payload.findByID({
          collection: 'project-reports',
          id: validatedParams.id,
          depth: 2, // Include relationship data
        })
      } else {
        // For regular users, check if they have access to the project
        report = await payload.find({
          collection: 'project-reports',
          where: {
            id: {
              equals: validatedParams.id,
            },
            'project.customer': {
              equals: user.id,
            },
          },
          depth: 2,
          limit: 1,
        })

        if (report.totalDocs === 0) {
          return NextResponse.json({
            success: false,
            error: 'Report not found or access denied'
          }, { status: 404 })
        }

        report = report.docs[0]
      }

      // For now, we'll just return the JSON data
      // In a real implementation, we would generate a PDF using a library like react-pdf
      if (validatedParams.format === 'json') {
        return NextResponse.json({
          success: true,
          data: report,
        })
      } else {
        // For PDF format, we'll return a placeholder message
        // In a real implementation, this would generate and return a PDF file
        return NextResponse.json({
          success: true,
          message: 'PDF generation is not implemented yet. This endpoint will generate a PDF in the future.',
          data: report,
        })
      }
    } catch (error) {
      console.error('Error fetching report for export:', error)
      return NextResponse.json({
        success: false,
        error: 'Report not found or access denied'
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Error exporting project report:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to export project report',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
