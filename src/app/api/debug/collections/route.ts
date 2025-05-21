import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/debug/collections: Received request')

    // Get the Payload client
    const payload = await getPayloadClient()

    // Get all registered collections
    const collections = Object.keys(payload.collections)

    // Check if service-projects is registered
    const hasServiceProjects = collections.includes('service-projects')

    // Get collection details if it exists
    let serviceProjectsDetails = null
    if (hasServiceProjects) {
      try {
        // Try to get the collection config
        serviceProjectsDetails = {
          config: payload.collections['service-projects'].config,
          // Try to count documents to verify DB access
          count: await payload.count({
            collection: 'service-projects',
          }),
        }
      } catch (collectionError) {
        serviceProjectsDetails = {
          error: `Error accessing collection: ${collectionError instanceof Error ? collectionError.message : String(collectionError)}`,
        }
      }
    }

    return NextResponse.json({
      collections,
      hasServiceProjects,
      serviceProjectsDetails,
      totalCollections: collections.length,
    })
  } catch (error) {
    console.error('Error in debug collections endpoint:', error)
    return NextResponse.json({
      error: 'Failed to get collections',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
