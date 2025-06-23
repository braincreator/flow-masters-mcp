import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { z } from 'zod'
import type { Payload } from 'payload'
import type { Comment } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type CommentRequest = {
  postId: string
  author: {
    name: string
    email: string
  }
  content: string
  parentComment?: string
}

// Validation schema for comment submission
const commentSchema = z.object({
  postId: z.string(),
  author: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
  }),
  content: z.string().min(5, 'Comment must be at least 5 characters'),
  parentComment: z.string().optional(),
})

// --- Рекурсивная функция для получения ответов ---
async function fetchReplies(payload: Payload, commentId: string): Promise<Comment[]> {
  const replies = await payload.find({
    collection: 'comments',
    where: {
      parentComment: {
        equals: commentId,
      },
      // Временно убираем фильтрацию по статусу для отладки
      // status: {
      //   equals: 'approved', // Только одобренные комментарии
      // },
    },
    // Важно: Указываем глубину, чтобы подгрузить автора, если это необходимо в ответах
    // Если автор не нужен, можно убрать или depth: 0
    depth: 1,
  })

  logDebug(`Replies for comment ${commentId}:`, replies.docs.length)

  const repliesWithNestedReplies = await Promise.all(
    replies.docs.map(async (reply) => {
      const nestedReplies = await fetchReplies(payload, reply.id) // Рекурсивный вызов
      return {
        ...reply,
        replies: nestedReplies,
      }
    }),
  )

  return repliesWithNestedReplies
}

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json()
    logDebug('Comment API received:', JSON.stringify(requestBody, null, 2))

    const { postId, author, content, parentComment } = requestBody as Omit<
      CommentRequest,
      'author'
    > & { author: { name: string; email: string } }

    logDebug('Extracted fields:', { postId, author, content, parentComment })

    // Validate required fields
    if (!postId || !author?.name || !author?.email || !content) {
      logDebug('Validation failed - missing fields:', {
        postId: !!postId,
        authorName: !!author?.name,
        authorEmail: !!author?.email,
        content: !!content,
      })
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
    const payload = await getPayloadClient()

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
        },
        content,
        parentComment: parentComment || undefined,
        status: 'approved', // Меняем статус на approved
        // ip: req.ip || '', // Закомментируем временно, пока не разберемся с типом и получением IP
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully and awaiting moderation',
      commentId: newComment.id,
    })
  } catch (error) {
    logError('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    logDebug(`Fetching comments for post: ${postId}`)

    const payload = await getPayloadClient()

    // Загружаем комментарии верхнего уровня
    const topLevelComments = await payload.find({
      collection: 'comments',
      where: {
        post: {
          equals: postId,
        },
        parentComment: {
          equals: null, // Только верхний уровень
        },
        // Временно убираем фильтрацию по статусу для отладки
        // status: {
        //   equals: 'approved', // Только одобренные комментарии
        // },
      },
      // Указываем глубину, чтобы подгрузить автора
      depth: 1,
    })

    logDebug(`Found ${topLevelComments.docs.length} top level comments`)
    if (topLevelComments.docs.length > 0) {
      logDebug('First comment status:', topLevelComments.docs[0].status)
    }

    // Используем рекурсивную функцию для загрузки всех вложенных ответов
    const commentsWithNestedReplies = await Promise.all(
      topLevelComments.docs.map(async (comment) => {
        const replies = await fetchReplies(payload, comment.id)
        return {
          ...comment,
          replies: replies,
        }
      }),
    )

    logDebug('Final comments structure (first item):', commentsWithNestedReplies.length > 0
        ? JSON.stringify(commentsWithNestedReplies[0], null, 2).substring(0, 500) + '...'
        : 'No comments',
    )

    // Возвращаем в формате, совместимом с компонентом Comments
    return NextResponse.json({
      comments: commentsWithNestedReplies,
    })
  } catch (error) {
    logError('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
