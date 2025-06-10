import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateTermsPage: CollectionAfterChangeHook = async ({
  doc,
  req: { payload },
}) => {
  try {
    // Revalidate the terms page for all locales
    revalidatePath('/en/terms')
    revalidatePath('/ru/terms')
    
    payload.logger.info(`Revalidated terms page after updating: ${doc.title}`)
  } catch (error) {
    payload.logger.error('Error revalidating terms page:', error)
  }
}
