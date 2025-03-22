import { createGlobalHook } from './revalidation'

export const revalidateForm = createGlobalHook('forms', {
  types: ['page']
})