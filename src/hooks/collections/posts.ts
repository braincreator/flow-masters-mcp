import { createCollectionHooks } from '@/utilities/revalidation'

export const postHooks = createCollectionHooks('posts', {
  types: ['page'],
  handleSlug: (doc) => `/posts/${doc.slug}`
})

export const { afterChange: revalidatePost, afterDelete: revalidatePostDelete } = postHooks