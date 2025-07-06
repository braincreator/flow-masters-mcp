import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyApiKey } from '@/utilities/auth'

export async function POST(req: NextRequest) {
  try {
    // Debug endpoints should be protected with API key authentication
    const authResult = await verifyApiKey(req)
    if (authResult) {
      return authResult
    }
    const payload = await getPayloadClient()

    // Create a test post
    const testPost = await payload.create({
      collection: 'posts',
      data: {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        excerpt: 'This is a test blog post created for debugging purposes.',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'This is a test blog post created for debugging purposes. It contains some sample content to verify that the blog functionality is working correctly.',
                  },
                ],
              },
            ],
          },
        },
        _status: 'published',
        publishedAt: new Date().toISOString(),
        readingTime: 2,
        meta: {
          title: 'Test Blog Post',
          description: 'This is a test blog post created for debugging purposes.',
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Test post created successfully',
      post: {
        id: testPost.id,
        title: testPost.title,
        slug: testPost.slug,
        _status: testPost._status,
        publishedAt: testPost.publishedAt,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error,
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to create a test post',
    usage: 'POST /api/debug/create-test-post',
  })
}
