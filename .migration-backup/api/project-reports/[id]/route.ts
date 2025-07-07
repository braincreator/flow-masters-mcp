import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../../helpers/auth'
import { z } from 'zod'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Validation schema for request parameters
const requestParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid report ID format' }),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate and parse request parameters
    let validatedId: string
    try {
      const validated = requestParamsSchema.parse({
        id: params.id,
      })
      validatedId = validated.id
    } catch (validationError) {
      logError('Validation error:', validationError)
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
          id: validatedId,
          depth: 2, // Include relationship data
        })
      } else {
        // For regular users, check if they have access to the project
        report = await payload.find({
          collection: 'project-reports',
          where: {
            id: {
              equals: validatedId,
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

      // Update clientViewed flag if this is the client viewing the report
      if (!user.roles?.includes('admin') && report.project.customer === user.id && !report.clientViewed) {
        await payload.update({
          collection: 'project-reports',
          id: validatedId,
          data: {
            clientViewed: true,
          },
        })
        
        // Update the report object to reflect the change
        report.clientViewed = true
      }

      return NextResponse.json({
        success: true,
        data: report,
      })
    } catch (error) {
      logError('Error fetching report:', error)
      return NextResponse.json({
        success: false,
        error: 'Report not found or access denied'
      }, { status: 404 })
    }
  } catch (error) {
    logError('Error fetching project report:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch project report',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
