import { createCollectionHooks } from '@/utilities/revalidation'

const { afterChange: revalidatePost, afterDelete: revalidateDelete } = createCollectionHooks('posts')

export { revalidatePost, revalidateDelete }
