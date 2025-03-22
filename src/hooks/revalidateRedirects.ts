import type { CollectionAfterChangeHook } from 'payload/types'
import { revalidateContent } from '@/utilities/revalidation'

export const revalidateRedirects: CollectionAfterChangeHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) {
    try {
      await revalidateContent({
        tag: 'redirects',
        payload,
        context,
        type: ['page', 'route']
      })
    } catch (error) {
      payload.logger.error(`Error revalidating redirects: ${error}`)
    }
  }

  return doc
}
