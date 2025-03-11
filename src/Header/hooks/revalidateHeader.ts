import type { GlobalAfterChangeHook } from 'payload'

export const revalidateHeader: GlobalAfterChangeHook = async ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    try {
      await fetch('/api/revalidate?tag=global_header', { method: 'POST' })
    } catch (error) {
      payload.logger.error(`Error revalidating header: ${error}`)
    }
  }

  return doc
}
