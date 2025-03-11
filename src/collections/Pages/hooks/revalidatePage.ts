import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
      payload.logger.info(`Revalidating page at path: ${path}`)

      try {
        await Promise.all([
          fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, { method: 'POST' }),
          fetch('/api/revalidate?tag=pages-sitemap', { method: 'POST' }),
        ])
      } catch (error) {
        payload.logger.error(`Error revalidating page: ${error}`)
      }
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`
      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      try {
        await Promise.all([
          fetch(`/api/revalidate?path=${encodeURIComponent(oldPath)}`, { method: 'POST' }),
          fetch('/api/revalidate?tag=pages-sitemap', { method: 'POST' }),
        ])
      } catch (error) {
        payload.logger.error(`Error revalidating old page: ${error}`)
      }
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = doc?.slug === 'home' ? '/' : `/${doc?.slug}`

    try {
      await Promise.all([
        fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, { method: 'POST' }),
        fetch('/api/revalidate?tag=pages-sitemap', { method: 'POST' }),
      ])
    } catch (error) {
      payload.logger.error(`Error revalidating deleted page: ${error}`)
    }
  }

  return doc
}
