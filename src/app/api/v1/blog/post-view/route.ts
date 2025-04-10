import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

interface PostViewRequest {
  slug: string
}

export async function POST(req: NextRequest) {
  try {
    // Получаем данные запроса
    const body = (await req.json()) as PostViewRequest
    console.log('[Post View API] Received request for slug:', body.slug)

    if (!body.slug) {
      console.error('[Post View API] Missing slug in request')
      return NextResponse.json({ error: 'Post slug is required' }, { status: 400 })
    }

    // Инициализируем Payload клиент
    const payload = await getPayloadClient()
    console.log('[Post View API] Payload client initialized')

    // Находим пост по slug
    const posts = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: body.slug },
        _status: { equals: 'published' },
      },
      limit: 1,
    })

    console.log(
      '[Post View API] Post search result:',
      posts.docs.length > 0 ? 'found' : 'not found',
    )

    if (!posts.docs.length) {
      console.error('[Post View API] Post not found:', body.slug)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = posts.docs[0]
    const postId = post.id
    console.log('[Post View API] Found post ID:', postId)

    // Ищем существующие метрики для этого поста
    const metricsResult = await payload.find({
      collection: 'post-metrics',
      where: {
        post: {
          equals: postId,
        },
      },
    })

    const now = new Date().toISOString()
    console.log(
      '[Post View API] Found existing metrics:',
      metricsResult.docs.length > 0 ? 'yes' : 'no',
    )

    if (metricsResult.docs.length > 0) {
      // Обновляем существующие метрики
      const metrics = metricsResult.docs[0]

      // Увеличиваем счетчик просмотров
      await payload.update({
        collection: 'post-metrics',
        id: metrics.id,
        data: {
          lastUpdated: now,
          views: (metrics.views || 0) + 1,
        },
      })

      console.log('[Post View API] Updated view count for post:', post.title)
      return NextResponse.json({ success: true, message: 'View count updated' })
    } else {
      // Создаем новые метрики
      await payload.create({
        collection: 'post-metrics',
        data: {
          title: post.title || 'Untitled Post',
          post: postId,
          lastUpdated: now,
          views: 1,
          shareCount: 0,
          likes: 0,
          completedReads: 0,
          shares: [],
          readingProgress: [],
        },
      })

      console.log('[Post View API] Created new metrics for post:', post.title)
      return NextResponse.json({ success: true, message: 'Metrics created with view' })
    }
  } catch (error) {
    console.error('[Post View API] Error tracking post view:', error)
    return NextResponse.json(
      {
        error: 'Error tracking post view',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
