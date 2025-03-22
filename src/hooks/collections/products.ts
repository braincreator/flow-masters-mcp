import { createCollectionHooks } from '@/utilities/revalidation'

export const productHooks = createCollectionHooks('products', {
  types: ['page'],
  handleSlug: (doc) => `/products/${doc.slug}`
})

export const { afterChange: revalidateProduct, afterDelete: revalidateProductDelete } = productHooks