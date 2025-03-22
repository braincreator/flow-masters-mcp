import { createCollectionHooks } from '@/utilities/revalidation'

const { afterChange: revalidatePage, afterDelete: revalidateDelete } = createCollectionHooks('pages', {
  handleSlug: (doc) => doc.slug === 'home' ? '' : doc.slug
})

export { revalidatePage, revalidateDelete }
