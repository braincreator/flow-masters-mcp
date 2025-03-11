'use server'

import { revalidateTag } from 'next/cache'

export async function revalidateGlobal(tag: string) {
  return revalidateTag(tag)
}
