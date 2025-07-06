import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/lib/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * GET /api/v1/service-projects/:id
 * Get a specific service project by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const { id } = await params
    logDebug(`[GET /api/v1/service-projects/${id}] Request received`)
    
    // Get the current user session
    const session = await getServerSession()
    if (!session?.user?.id) {
      logError(`[GET /api/v1/service-projects/${id}] Authentication required`)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!id) {
      logError(`[GET /api/v1/service-projects/${id}] Project ID is required`)
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const userId = session.user.id
    const isAdmin = session.user.isAdmin || session.user.roles?.includes('admin')

    logDebug(`[GET /api/v1/service-projects/${id}] User ID: ${userId}, isAdmin: ${isAdmin}`)

    // Build the query to find the project
    // If user is admin, they can access any project
    // Otherwise, they can only access projects where they are the customer or assignee
    const query: any = {
      id: {
        equals: id,
      },
    }

    // If not admin, add access control
    if (!isAdmin) {
      query.or = [
        {
          'customer.id': {
            equals: userId,
          },
        },
        {
          'assignedTo.id': {
            equals: userId,
          },
        },
      ]
    }

    logDebug(`[GET /api/v1/service-projects/${id}] Query:`, JSON.stringify(query))

    // Find the project
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: query,
      depth: 2, // Include related data
      limit: 1,
    })

    logDebug(`[GET /api/v1/service-projects/${id}] Found ${projectResponse.totalDocs} projects`)

    if (projectResponse.totalDocs === 0) {
      logError(`[GET /api/v1/service-projects/${id}] Project not found or access denied`)
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Return the project
    return NextResponse.json(projectResponse.docs[0])
  } catch (error) {
    // Get the id safely for error logging
    const id = params?.id ? await params.id : 'unknown'
    logError(`[GET /api/v1/service-projects/${id}] Error:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch project details' },
      { status: 500 }
    )
  }
}
