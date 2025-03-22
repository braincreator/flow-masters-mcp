import { createCollectionHooks } from './revalidation'

export const pageHooks = createCollectionHooks('pages', {
  types: ['page', 'layout'],
  handleSlug: (doc) => doc.slug === 'home' ? '' : doc.slug
})

export const { afterChange: revalidatePage, afterDelete: revalidatePageDelete } = pageHooks
