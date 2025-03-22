import { createGlobalHook } from '@/utilities/revalidation'

export const revalidateFooter = createGlobalHook('footer', {
  types: ['layout']
})