import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(req.url)
    const locale = searchParams.get('locale') || 'en'

    logDebug('[Blog Post API] Request for slug:', slug, 'locale:', locale)

    if (!slug) {
      return NextResponse.json(
        { error: 'Post slug is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Fetch the post by slug
    const posts = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        _status: { equals: 'published' }
      },
      limit: 1,
      depth: 2, // Load relations
      locale
    })

    logDebug('[Blog Post API] Found posts:', posts.docs.length)

    if (!posts.docs.length) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const post = posts.docs[0]

    // Track post view (optional - you can remove this if you don't want automatic tracking)
    try {
      await fetch(`${req.nextUrl.origin}/api/v1/blog/post-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug })
      })
    } catch (viewError) {
      logWarn('[Blog Post API] Failed to track view:', viewError)
      // Don't fail the request if view tracking fails
    }

    logDebug('[Blog Post API] Returning post:', post.title)

    return NextResponse.json(post)
  } catch (error) {
    logError('[Blog Post API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch blog post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
