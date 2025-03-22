import { createCollectionHooks } from './revalidation'

export const searchHooks = createCollectionHooks('search', {
  types: ['page'],
  handleSlug: (doc) => `search/${doc.slug}`
})

export const { afterChange: revalidateSearch, afterDelete: revalidateSearchDelete } = searchHooks