import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyApiKey } from '@/utilities/auth'

export async function GET(req: NextRequest) {
  try {
    // Debug endpoints should be protected with API key authentication
    const authResult = await verifyApiKey(req)
    if (authResult) {
      return authResult
    }
    const payload = await getPayloadClient()

    console.log('Testing posts collection...')

    // Test 1: Check if posts collection exists
    const collections = payload.config.collections.map((c) => c.slug)
    console.log('Available collections:', collections)

    if (!collections.includes('posts')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Posts collection not found',
          availableCollections: collections,
        },
        { status: 404 },
      )
    }

    // Test 2: Try to count all posts
    let totalCount = 0
    try {
      const countResult = await payload.count({
        collection: 'posts',
      })
      totalCount = countResult.totalDocs
      console.log('Total posts count:', totalCount)
    } catch (countError) {
      console.error('Error counting posts:', countError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to count posts',
          details: countError.message,
        },
        { status: 500 },
      )
    }

    // Test 3: Try to fetch posts without any filters
    let allPosts = null
    try {
      allPosts = await payload.find({
        collection: 'posts',
        limit: 5,
        depth: 0, // No relations to avoid issues
      })
      console.log('Fetched posts without filters:', allPosts.docs.length)
    } catch (fetchError) {
      console.error('Error fetching posts without filters:', fetchError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch posts without filters',
          details: fetchError.message,
        },
        { status: 500 },
      )
    }

    // Test 4: Try to fetch published posts
    let publishedPosts = null
    try {
      publishedPosts = await payload.find({
        collection: 'posts',
        where: {
          _status: { equals: 'published' },
        },
        limit: 5,
        depth: 0,
      })
      console.log('Fetched published posts:', publishedPosts.docs.length)
    } catch (publishedError) {
      console.error('Error fetching published posts:', publishedError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch published posts',
          details: publishedError.message,
          totalCount,
          allPostsCount: allPosts?.docs.length || 0,
        },
        { status: 500 },
      )
    }

    // Test 5: Get sample post data
    let samplePost = null
    if (allPosts && allPosts.docs.length > 0) {
      samplePost = {
        id: allPosts.docs[0].id,
        title: allPosts.docs[0].title,
        _status: allPosts.docs[0]._status,
        publishedAt: allPosts.docs[0].publishedAt,
        hasContent: !!allPosts.docs[0].content,
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        collectionsAvailable: collections.includes('posts'),
        totalCount,
        allPostsCount: allPosts?.docs.length || 0,
        publishedCount: publishedPosts?.docs.length || 0,
        samplePost,
      },
    })
  } catch (error) {
    console.error('Test posts error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
