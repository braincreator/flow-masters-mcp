import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyApiKey } from '@/utilities/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(req: NextRequest) {
  try {
    // Debug endpoints should be protected with API key authentication
    const authResult = await verifyApiKey(req)
    if (authResult) {
      return authResult
    }

    logDebug('GET /api/debug/collections: Received authenticated request')

    // Get the Payload client
    const payload = await getPayloadClient()

    // Get all registered collections
    const collections = Object.keys(payload.collections)

    // Check if posts is registered
    const hasPosts = collections.includes('posts')

    // Get posts collection details if it exists
    let postsDetails = null
    if (hasPosts) {
      try {
        // Try to get the collection config and count documents
        const totalCount = await payload.count({
          collection: 'posts',
        })

        const publishedCount = await payload.count({
          collection: 'posts',
          where: {
            _status: { equals: 'published' }
          }
        })

        // Get a sample post
        let samplePost = null
        if (totalCount.totalDocs > 0) {
          const sample = await payload.find({
            collection: 'posts',
            limit: 1,
          })
          if (sample.docs.length > 0) {
            samplePost = {
              id: sample.docs[0].id,
              title: sample.docs[0].title,
              _status: sample.docs[0]._status,
              publishedAt: sample.docs[0].publishedAt
            }
          }
        }

        postsDetails = {
          totalCount: totalCount.totalDocs,
          publishedCount: publishedCount.totalDocs,
          samplePost
        }
      } catch (collectionError) {
        postsDetails = {
          error: `Error accessing posts collection: ${collectionError instanceof Error ? collectionError.message : String(collectionError)}`,
        }
      }
    }

    return NextResponse.json({
      collections,
      hasPosts,
      postsDetails,
      totalCollections: collections.length,
    })
  } catch (error) {
    logError('Error in debug collections endpoint:', error)
    return NextResponse.json({
      error: 'Failed to get collections',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
