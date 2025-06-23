import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface PostViewRequest {
  slug: string
}

export async function POST(req: NextRequest) {
  let postId: string | number | undefined
  let postSlug: string | undefined

  try {
    const body = (await req.json()) as PostViewRequest
    postSlug = body.slug // Store slug for error logging
    logDebug('[Post View API] Received request for slug:', postSlug)

    if (!postSlug) {
      logError('[Post View API] Missing slug in request')
      return NextResponse.json({ error: 'Post slug is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    logDebug('[Post View API] Payload client initialized')

    const posts = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: postSlug },
        _status: { equals: 'published' },
      },
      limit: 1,
      depth: 0, // We only need the ID and title
    })

    logDebug('[Post View API] Post search result:', posts.docs.length > 0 ? 'found' : 'not found',
    )

    if (!posts.docs.length || !posts.docs[0].id) {
      logError('[Post View API] Post not found or missing ID for slug:', postSlug)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = posts.docs[0]
    postId = post.id // Store postId for error logging
    logDebug('[Post View API] Found post ID:', postId)

    const metricsResult = await payload.find({
      collection: 'post-metrics',
      where: {
        post: { equals: postId },
      },
      limit: 1,
      depth: 0, // We only need the ID and views count
    })

    const now = new Date().toISOString()
    logDebug('[Post View API] Found existing metrics:', metricsResult.docs.length > 0 ? 'yes' : 'no',
    )

    if (metricsResult.docs.length > 0 && metricsResult.docs[0].id) {
      const metrics = metricsResult.docs[0]
      const metricsId = metrics.id

      await payload.update({
        collection: 'post-metrics',
        id: metricsId, // Use the existing metrics ID
        data: {
          views: (Number(metrics.views) || 0) + 1, // Ensure views is treated as number
          lastUpdated: now,
        },
      })

      logDebug('[Post View API] Updated view count for post ID:', postId)
      return NextResponse.json({ success: true, message: 'View count updated' })
    } else {
      // Check if post title exists, provide fallback
      const postTitle = post.title || 'Untitled Post'

      await payload.create({
        collection: 'post-metrics',
        data: {
          post: postId, // Link to the post using ID
          title: postTitle, // Use fetched or fallback title
          views: 1,
          lastUpdated: now,
          // Optional: Initialize other fields if they exist in your collection
          shareCount: 0,
          likes: 0,
          completedReads: 0,
          shares: [],
          readingProgress: [],
        },
      })

      logDebug('[Post View API] Created new metrics for post ID:', postId)
      return NextResponse.json({ success: true, message: 'Metrics created with view' })
    }
  } catch (error) {
    logError(
      `[Post View API] Error tracking post view for slug '${postSlug || 'unknown'}' (Post ID: ${postId || 'unknown'}):`,
      error,
    )
    return NextResponse.json(
      {
        error: 'Error tracking post view',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
