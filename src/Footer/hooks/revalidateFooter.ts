import type { GlobalAfterChangeHook } from 'payload'

export const revalidateFooter: GlobalAfterChangeHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    try {
      await fetch('/api/revalidate?tag=global_footer', { method: 'POST' })
    } catch (error) {
      payload.logger.error(`Error revalidating footer: ${error}`)
    }
  }

  return doc
}
