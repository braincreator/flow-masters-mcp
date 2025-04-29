import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

interface MetricsRequest {
  postId: string
  action: 'view' | 'share' | 'like' | 'progress'
  platform?: string // For share metrics
  progress?: number // For reading progress (25, 75, 100)
}

export async function POST(req: NextRequest) {
  let payload

  try {
    // Получаем данные запроса
    const body = (await req.json()) as MetricsRequest
    console.log('[Metrics API] Received request:', { postId: body.postId, action: body.action })

    // Проверяем обязательные параметры
    if (!body.postId) {
      console.error('[Metrics API] Missing postId in request')
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    if (!body.action) {
      console.error('[Metrics API] Missing action in request')
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Инициализируем Payload клиент
    try {
      payload = await getPayloadClient()
      console.log('[Metrics API] Payload client initialized')
    } catch (payloadError) {
      console.error('[Metrics API] Failed to initialize Payload client:', payloadError)
      return NextResponse.json(
        {
          error: 'Database connection error',
          details: payloadError instanceof Error ? payloadError.message : 'Unknown error',
        },
        { status: 500 },
      )
    }

    // Проверяем существование поста
    let postExists
    try {
      postExists = await payload.findByID({
        collection: 'posts',
        id: body.postId,
        depth: 0,
      })

      console.log('[Metrics API] Post verification result:', postExists ? 'found' : 'not found')
    } catch (findError) {
      console.error('[Metrics API] Error verifying post existence:', findError)
      return NextResponse.json(
        {
          error: 'Error verifying post',
          details: findError instanceof Error ? findError.message : 'Unknown error',
        },
        { status: 500 },
      )
    }

    if (!postExists) {
      console.error('[Metrics API] Post not found:', body.postId)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    console.log('[Metrics API] Processing metrics for post:', postExists.title || body.postId)

    // Ищем существующие метрики для этого поста
    let metricsResult
    try {
      metricsResult = await payload.find({
        collection: 'post-metrics',
        where: {
          post: {
            equals: body.postId,
          },
        },
      })
      console.log(
        '[Metrics API] Found existing metrics:',
        metricsResult.docs.length > 0 ? 'yes' : 'no',
      )
    } catch (findMetricsError) {
      console.error('[Metrics API] Error finding metrics:', findMetricsError)
      return NextResponse.json(
        {
          error: 'Error retrieving metrics',
          details: findMetricsError instanceof Error ? findMetricsError.message : 'Unknown error',
        },
        { status: 500 },
      )
    }

    if (metricsResult.docs.length > 0) {
      // Обновляем существующие метрики
      const metrics = metricsResult.docs[0]
      const updateData: Record<string, any> = {
        lastUpdated: now,
      }

      // Обновляем конкретные метрики в зависимости от действия
      switch (body.action) {
        case 'view':
          updateData.views = (metrics.views || 0) + 1
          break
        case 'share':
          // Добавляем информацию о платформе в массив shares
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
          // Отслеживаем прогресс чтения
          if (body.progress) {
            updateData.readingProgress = [
              ...(metrics.readingProgress || []),
              {
                progress: body.progress,
                date: now,
              },
            ]
            // Если пользователь дочитал статью до конца (100% прогресс)
            if (body.progress === 100) {
              updateData.completedReads = (metrics.completedReads || 0) + 1
            }
          }
          break
      }

      try {
        await payload.update({
          collection: 'post-metrics',
          id: metrics.id,
          data: updateData,
        })
        console.log('[Metrics API] Updated metrics successfully for action:', body.action)
      } catch (updateError) {
        console.error('[Metrics API] Error updating metrics:', updateError)
        return NextResponse.json(
          {
            error: 'Error updating metrics',
            details: updateError instanceof Error ? updateError.message : 'Unknown error',
          },
          { status: 500 },
        )
      }

      return NextResponse.json({ success: true, message: 'Metrics updated' })
    } else {
      // Создаем новые метрики
      const createData: Record<string, any> = {
        title: postExists.title || 'Untitled Post',
        post: body.postId,
        lastUpdated: now,
        views: 0,
        shareCount: 0,
        likes: 0,
        completedReads: 0,
        shares: [],
        readingProgress: [],
      }

      // Устанавливаем конкретные метрики в зависимости от действия
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
          // Отслеживаем прогресс чтения для новой записи метрик
          if (body.progress) {
            createData.readingProgress = [
              {
                progress: body.progress,
                date: now,
              },
            ]
            // Если пользователь дочитал до конца (100% прогресс)
            if (body.progress === 100) {
              createData.completedReads = 1
            }
          }
          break
      }

      try {
        await payload.create({
          collection: 'post-metrics',
          data: createData,
        })
        console.log('[Metrics API] Created new metrics for action:', body.action)
      } catch (createError) {
        console.error('[Metrics API] Error creating metrics:', createError)
        return NextResponse.json(
          {
            error: 'Error creating metrics',
            details: createError instanceof Error ? createError.message : 'Unknown error',
          },
          { status: 500 },
        )
      }

      return NextResponse.json({ success: true, message: 'Metrics created' })
    }
  } catch (error) {
    console.error('[Metrics API] Unhandled error in metrics API:', error)

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
