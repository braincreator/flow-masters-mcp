import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export const revalidatePage: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/products/${doc.slug}`
      payload.logger.info(`Revalidating product at path: ${path}`)

      try {
        await Promise.all([
          fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, { method: 'POST' }),
          fetch('/api/revalidate?tag=products-sitemap', { method: 'POST' }),
        ])
      } catch (error) {
        payload.logger.error(`Error revalidating product: ${error}`)
      }
    }

    // If the product was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/products/${previousDoc.slug}`
      payload.logger.info(`Revalidating old product at path: ${oldPath}`)

      try {
        await Promise.all([
          fetch(`/api/revalidate?path=${encodeURIComponent(oldPath)}`, { method: 'POST' }),
          fetch('/api/revalidate?tag=products-sitemap', { method: 'POST' }),
        ])
      } catch (error) {
        payload.logger.error(`Error revalidating old product: ${error}`)
      }
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/products/${doc?.slug}`

    try {
      await Promise.all([
        fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, { method: 'POST' }),
        fetch('/api/revalidate?tag=products-sitemap', { method: 'POST' }),
      ])
    } catch (error) {
      payload.logger.error(`Error revalidating deleted product: ${error}`)
    }
  }

  return doc
}