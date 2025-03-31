import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

interface MetricsRequest {
  postId: string
  action: 'view' | 'share' | 'like' | 'progress'
  platform?: string // For share metrics
  progress?: number // For reading progress (25, 75, 100)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MetricsRequest

    if (!body.postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    if (!body.action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Verify post exists
    const payload = await getPayloadClient()
    const postExists = await payload
      .findByID({
        collection: 'posts',
        id: body.postId,
        depth: 0,
      })
      .catch(() => null)

    if (!postExists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Find existing metrics for this post
    const metricsResult = await payload.find({
      collection: 'post-metrics',
      where: {
        post: {
          equals: body.postId,
        },
      },
    })

    const now = new Date().toISOString()

    if (metricsResult.docs.length > 0) {
      // Update existing metrics
      const metrics = metricsResult.docs[0]
      const updateData: Record<string, any> = {
        lastUpdated: now,
      }

      // Update the specific metric based on the action
      switch (body.action) {
        case 'view':
          updateData.views = (metrics.views || 0) + 1
          break
        case 'share':
          // Add to shares array with platform info
          updateData.shares = [
            ...(metrics.shares || []),
            {
              platform: body.platform || 'unknown',
              date: now,
            },
          ]
          updateData.shareCount = (metrics.shareCount || 0) + 1
          break
        case 'like':
          updateData.likes = (metrics.likes || 0) + 1
          break
        case 'progress':
          // Track reading progress
          if (body.progress) {
            // Add reading progress data
            updateData.readingProgress = [
              ...(metrics.readingProgress || []),
              {
                progress: body.progress,
                date: now,
              },
            ]
            // If user completed reading the article (100% progress)
            if (body.progress === 100) {
              updateData.completedReads = (metrics.completedReads || 0) + 1
            }
          }
          break
      }

      await payload.update({
        collection: 'post-metrics',
        id: metrics.id,
        data: updateData,
      })

      return NextResponse.json({ success: true, message: 'Metrics updated' })
    } else {
      // Create new metrics
      const createData: Record<string, any> = {
        post: body.postId,
        lastUpdated: now,
        views: 0,
        shareCount: 0,
        likes: 0,
        completedReads: 0,
      }

      // Set the specific metric based on the action
      switch (body.action) {
        case 'view':
          createData.views = 1
          break
        case 'share':
          createData.shares = [
            {
              platform: body.platform || 'unknown',
              date: now,
            },
          ]
          createData.shareCount = 1
          break
        case 'like':
          createData.likes = 1
          break
        case 'progress':
          // Track reading progress for new metrics record
          if (body.progress) {
            createData.readingProgress = [
              {
                progress: body.progress,
                date: now,
              },
            ]
            // If user completed reading (100% progress)
            if (body.progress === 100) {
              createData.completedReads = 1
            }
          }
          break
      }

      await payload.create({
        collection: 'post-metrics',
        data: createData,
      })

      return NextResponse.json({ success: true, message: 'Metrics created' })
    }
  } catch (error) {
    console.error('Error tracking post metrics:', error)

    return NextResponse.json(
      {
        error: 'Error tracking metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // Method not allowed - metrics API is POST only
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
