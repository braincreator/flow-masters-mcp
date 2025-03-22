import { createGlobalHook } from '@/utilities/revalidation'

export const revalidateHeader = createGlobalHook('header', {
  types: ['layout']
})