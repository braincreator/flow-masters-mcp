import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function POST(request: NextRequest) {
  try {
    // Проверяем секретный ключ для безопасности
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'default-secret'}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем данные из запроса
    const body = await request.json()
    const { collection, operation, doc } = body

    logDebug(`🔄 Revalidating sitemap for ${collection} ${operation}:`, doc?.slug || doc?.id)

    // Инвалидируем кэш для всех sitemap
    revalidateTag('pages-sitemap')
    revalidateTag('posts-sitemap')
    revalidateTag('services-sitemap')

    // Также можем инвалидировать конкретные страницы
    if (collection === 'pages' && doc?.slug) {
      revalidateTag(`page-${doc.slug}`)
    }
    
    if (collection === 'posts' && doc?.slug) {
      revalidateTag(`post-${doc.slug}`)
    }
    
    if (collection === 'services' && doc?.slug) {
      revalidateTag(`service-${doc.slug}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap cache invalidated',
      collection,
      operation,
      slug: doc?.slug
    })

  } catch (error) {
    logError('Error revalidating sitemap:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// GET метод для ручной инвалидации (для тестирования)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const secret = url.searchParams.get('secret')
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Инвалидируем все sitemap кэши
    revalidateTag('pages-sitemap')
    revalidateTag('posts-sitemap')
    revalidateTag('services-sitemap')

    return NextResponse.json({ 
      success: true, 
      message: 'All sitemap caches invalidated manually' 
    })

  } catch (error) {
    logError('Error in manual revalidation:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
