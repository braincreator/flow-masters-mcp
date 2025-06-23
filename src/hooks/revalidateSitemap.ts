import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Hook для автоматической инвалидации sitemap кэша при изменении контента
 */
export const revalidateSitemap: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  try {
    const { payload } = req

    // Инвалидируем кэш для соответствующего sitemap
    switch (collection?.slug) {
      case 'pages':
        revalidateTag('pages-sitemap')
        payload.logger.info(`🗺️ Revalidated pages-sitemap for page: ${doc.slug}`)
        break
      
      case 'posts':
        revalidateTag('posts-sitemap')
        payload.logger.info(`🗺️ Revalidated posts-sitemap for post: ${doc.slug}`)
        break
      
      case 'services':
        revalidateTag('services-sitemap')
        payload.logger.info(`🗺️ Revalidated services-sitemap for service: ${doc.slug}`)
        break
      
      default:
        // Для других коллекций инвалидируем все sitemap
        revalidateTag('pages-sitemap')
        revalidateTag('posts-sitemap')
        revalidateTag('services-sitemap')
        payload.logger.info(`🗺️ Revalidated all sitemaps for collection: ${collection?.slug}`)
    }

    // Также инвалидируем основной sitemap
    revalidateTag('main-sitemap')

    // Опционально: вызываем webhook для внешних систем
    if (process.env.NODE_ENV === 'production') {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
        const webhookUrl = `${baseUrl}/api/revalidate-sitemap`
        
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET || 'default-secret'}`
          },
          body: JSON.stringify({
            collection: collection?.slug,
            operation,
            doc: {
              id: doc.id,
              slug: doc.slug,
              title: doc.title
            }
          })
        })
        
        payload.logger.info(`🔄 Sent sitemap revalidation webhook for ${collection?.slug}`)
      } catch (webhookError) {
        payload.logger.error('Failed to send sitemap revalidation webhook:', webhookError)
      }
    }

  } catch (error) {
    req.payload.logger.error('Error revalidating sitemap:', error)
  }
}

/**
 * Hook для инвалидации sitemap при удалении контента
 */
export const revalidateSitemapDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
  collection,
}) => {
  try {
    const { payload } = req

    // Инвалидируем кэш для соответствующего sitemap
    switch (collection?.slug) {
      case 'pages':
        revalidateTag('pages-sitemap')
        payload.logger.info(`🗺️ Revalidated pages-sitemap after deleting page: ${doc.slug}`)
        break
      
      case 'posts':
        revalidateTag('posts-sitemap')
        payload.logger.info(`🗺️ Revalidated posts-sitemap after deleting post: ${doc.slug}`)
        break
      
      case 'services':
        revalidateTag('services-sitemap')
        payload.logger.info(`🗺️ Revalidated services-sitemap after deleting service: ${doc.slug}`)
        break
      
      default:
        // Для других коллекций инвалидируем все sitemap
        revalidateTag('pages-sitemap')
        revalidateTag('posts-sitemap')
        revalidateTag('services-sitemap')
        payload.logger.info(`🗺️ Revalidated all sitemaps after deleting from collection: ${collection?.slug}`)
    }

    // Также инвалидируем основной sitemap
    revalidateTag('main-sitemap')

  } catch (error) {
    req.payload.logger.error('Error revalidating sitemap after delete:', error)
  }
}

/**
 * Утилита для ручной инвалидации всех sitemap
 */
export const revalidateAllSitemaps = () => {
  try {
    revalidateTag('pages-sitemap')
    revalidateTag('posts-sitemap')
    revalidateTag('services-sitemap')
    revalidateTag('main-sitemap')
    logDebug('🗺️ All sitemap caches invalidated')
  } catch (error) {
    logError('Error invalidating sitemap caches:', error)
  }
}
