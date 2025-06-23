import { NextRequest, NextResponse } from 'next/server'
import getPayload from 'payload'
import configPromise from '@/payload.config'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type ShareRequest = {
  postId: string
  platform: string
}

export async function POST(req: NextRequest) {
  try {
    const { postId, platform } = (await req.json()) as ShareRequest

    if (!postId || !platform) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const allowedPlatforms = ['twitter', 'facebook', 'linkedin', 'email', 'copy']

    if (!allowedPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // Initialize Payload
    const payload = await getPayload({ config: configPromise })

    // Find existing metrics for this post
    const metricsResult = await payload.find({
      collection: 'post-metrics',
      where: {
        post: {
          equals: postId,
        },
      },
    })

    if (metricsResult.docs.length > 0) {
      // Update existing metrics
      const metrics = metricsResult.docs[0]

      // Increment the share count for the specific platform
      const updatedShares = {
        ...(metrics.shares || {}),
        total: (metrics.shares?.total || 0) + 1,
        [platform]: (metrics.shares?.[platform] || 0) + 1,
      }

      await payload.update({
        collection: 'post-metrics',
        id: metrics.id,
        data: {
          shares: updatedShares,
          lastUpdated: new Date().toISOString(),
        },
      })
    } else {
      // Create new metrics with the share
      const shares = {
        total: 1,
        twitter: platform === 'twitter' ? 1 : 0,
        facebook: platform === 'facebook' ? 1 : 0,
        linkedin: platform === 'linkedin' ? 1 : 0,
        email: platform === 'email' ? 1 : 0,
      }

      await payload.create({
        collection: 'post-metrics',
        data: {
          post: postId,
          shares,
          lastUpdated: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Error tracking share:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  // Method not allowed
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
