import { NextRequest, NextResponse } from 'next/server'
import getPayload from 'payload'
import configPromise from '@/payload.config'

type CommentRequest = {
  postId: string
  author: {
    name: string
    email: string
    website?: string
  }
  content: string
  parentComment?: string
}

export async function POST(req: NextRequest) {
  try {
    const { postId, author, content, parentComment } = (await req.json()) as CommentRequest

    // Validate required fields
    if (!postId || !author?.name || !author?.email || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Basic validation
    if (content.length < 5) {
      return NextResponse.json({ error: 'Comment is too short' }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(author.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Initialize Payload
    const payload = await getPayload({ config: configPromise })

    // Check if post exists
    try {
      await payload.findByID({
        collection: 'posts',
        id: postId,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // If there's a parent comment, verify it exists
    if (parentComment) {
      try {
        await payload.findByID({
          collection: 'comments',
          id: parentComment,
        })
      } catch (error) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }
    }

    // Create the comment
    const newComment = await payload.create({
      collection: 'comments',
      data: {
        post: postId,
        author: {
          name: author.name,
          email: author.email,
          website: author.website || '',
        },
        content,
        parentComment: parentComment || undefined,
        status: 'pending', // All comments are pending by default until approved
        ip: req.ip || '',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully and awaiting moderation',
      commentId: newComment.id,
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Initialize Payload
    const payload = await getPayload({ config: configPromise })

    // Get approved comments for this post
    const comments = await payload.find({
      collection: 'comments',
      where: {
        post: {
          equals: postId,
        },
        status: {
          equals: 'approved',
        },
        parentComment: {
          exists: false, // Only get top-level comments
        },
      },
      sort: '-createdAt',
      depth: 1, // Include referenced fields
    })

    // Get replies to these comments
    for (let i = 0; i < comments.docs.length; i++) {
      const replies = await payload.find({
        collection: 'comments',
        where: {
          parentComment: {
            equals: comments.docs[i].id,
          },
          status: {
            equals: 'approved',
          },
        },
        sort: 'createdAt',
      })

      comments.docs[i].replies = replies.docs
    }

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
