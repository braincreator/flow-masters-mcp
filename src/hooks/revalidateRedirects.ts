import type { CollectionAfterChangeHook } from 'payload'

export const revalidateRedirects: CollectionAfterChangeHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating redirects`)

    try {
      await fetch('/api/revalidate?tag=redirects', { method: 'POST' })
    } catch (error) {
      payload.logger.error(`Error revalidating redirects: ${error}`)
    }
  }

  return doc
}
