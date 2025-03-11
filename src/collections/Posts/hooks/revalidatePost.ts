import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/posts/${doc.slug}`
      payload.logger.info(`Revalidating post at path: ${path}`)

      try {
        await Promise.all([
          fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, { method: 'POST' }),
          fetch('/api/revalidate?tag=posts-sitemap', { method: 'POST' }),
        ])
      } catch (error) {
        payload.logger.error(`Error revalidating post: ${error}`)
      }
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/posts/${previousDoc.slug}`
      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      try {
        await Promise.all([
          fetch(`/api/revalidate?path=${encodeURIComponent(oldPath)}`, { method: 'POST' }),
          fetch('/api/revalidate?tag=posts-sitemap', { method: 'POST' }),
        ])
      } catch (error) {
        payload.logger.error(`Error revalidating old post: ${error}`)
      }
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc?.slug}`

    try {
      await Promise.all([
        fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, { method: 'POST' }),
        fetch('/api/revalidate?tag=posts-sitemap', { method: 'POST' }),
      ])
    } catch (error) {
      payload.logger.error(`Error revalidating deleted post: ${error}`)
    }
  }

  return doc
}
