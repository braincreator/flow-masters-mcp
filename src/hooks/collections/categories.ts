import { createCollectionHooks } from '@/utilities/revalidation'

export const categoryHooks = createCollectionHooks('categories', {
  types: ['page', 'layout'],
  handleSlug: (doc) => `/categories/${doc.slug}`
})

export const { afterChange: revalidateCategory, afterDelete: revalidateCategoryDelete } = categoryHooks