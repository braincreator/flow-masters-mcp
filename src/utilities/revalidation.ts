import type { PayloadRequest } from 'payload'
import type {
  RevalidateOptions,
  RevalidateCollectionArgs,
  RevalidateDeleteArgs,
  CollectionHookOptions,
  GlobalHookOptions,
  ContentType
} from '@/types/revalidation'

import { revalidateTag, revalidatePath } from 'next/cache'

export async function revalidateContent({
  path,
  tag,
  collection,
  slug,
  payload,
  context,
  type = ['layout', 'page']
}: RevalidateOptions) {
  if (context?.disableRevalidate) return

  const types = Array.isArray(type) ? type : [type]

  try {
    // Global elements revalidation
    const globalTags = ['header', 'footer', 'navigation', 'global_header', 'global_footer']
    await Promise.all(globalTags.map(tag => revalidateTag(tag)))

    // Root path revalidation
    await Promise.all(types.map(t => revalidatePath('/', t)))

    // Specific path revalidation
    if (path) {
      await Promise.all(types.map(t => revalidatePath(path, t)))
    }

    // Collection path and sitemap revalidation
    if (collection && slug) {
      const collectionPath = `/${collection}/${slug}`
      await Promise.all([
        ...types.map(t => revalidatePath(collectionPath, t)),
        revalidateTag(`${collection}-sitemap`)
      ])
    }

    // Specific tag revalidation
    if (tag) {
      await revalidateTag(tag)
    }

    // Main sitemap revalidation
    await revalidateTag('sitemap')

    if (payload?.logger) {
      const revalidatedPath = path || (collection && slug ? `/${collection}/${slug}` : '')
      payload.logger.info(`Revalidated: ${revalidatedPath} [${types.join(', ')}]`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (payload?.logger) {
      payload.logger.error(`Revalidation error: ${errorMessage}`)
    } else {
      console.error('Revalidation error:', errorMessage)
    }
    throw error // Re-throw to handle it in the calling function
  }
}

export const revalidateCollection = async ({
  doc,
  previousDoc,
  req,
  collection,
}: RevalidateCollectionArgs) => {
  const { payload, context } = req

  const handleRevalidation = async (docToRevalidate: any, isUnpublish = false) => {
    await revalidateContent({
      path: `/${collection}/${docToRevalidate.slug}`,
      tag: `${collection}-sitemap`,
      collection,
      slug: docToRevalidate.slug,
      payload,
      context
    })
  }

  try {
    if (doc._status === 'published') {
      await handleRevalidation(doc)
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      await handleRevalidation(previousDoc, true)
    }
  } catch (error) {
    payload.logger.error(`Error in revalidateCollection: ${error}`)
  }
}

export const revalidateDelete = async ({
  doc,
  req,
  collection,
}: RevalidateDeleteArgs) => {
  const { payload, context } = req

  try {
    await revalidateContent({
      path: `/${collection}/${doc?.slug}`,
      tag: `${collection}-sitemap`,
      collection,
      slug: doc?.slug,
      payload,
      context
    })
  } catch (error) {
    payload.logger.error(`Error in revalidateDelete: ${error}`)
  }
}

// Collection-specific revalidation helpers
export const revalidatePages = async (args: { doc: any; previousDoc?: any; req: PayloadRequest }) => {
  await revalidateCollection({ ...args, collection: 'pages' })
}

export const revalidatePosts = async (args: { doc: any; previousDoc?: any; req: PayloadRequest }) => {
  await revalidateCollection({ ...args, collection: 'posts' })
}

export const revalidateProducts = async (args: { doc: any; previousDoc?: any; req: PayloadRequest }) => {
  await revalidateCollection({ ...args, collection: 'products' })
}

export function createCollectionHooks(collection: string, options: CollectionHookOptions = {}) {
  const { handleSlug, types = ['page', 'layout'] } = options

  return {
    afterChange: async ({ doc, previousDoc, req }) => {
      const { payload, context } = req
      
      if (!context?.disableRevalidate) {
        const slug = handleSlug ? handleSlug(doc) : doc.slug
        const previousSlug = handleSlug && previousDoc ? handleSlug(previousDoc) : previousDoc?.slug

        try {
          if (doc._status === 'published') {
            await revalidateContent({
              path: `/${collection}/${slug}`,
              tag: `${collection}-sitemap`,
              collection,
              slug,
              payload,
              context,
              type: types
            })
          }

          if (previousDoc?._status === 'published' && doc._status !== 'published') {
            await revalidateContent({
              path: `/${collection}/${previousSlug}`,
              tag: `${collection}-sitemap`,
              collection,
              slug: previousSlug,
              payload,
              context,
              type: types
            })
          }
        } catch (error) {
          payload.logger.error(`Error in collection hook: ${error}`)
        }
      }
      return doc
    },

    afterDelete: async ({ doc, req }) => {
      const { payload, context } = req
      
      if (!context?.disableRevalidate) {
        try {
          const slug = handleSlug ? handleSlug(doc) : doc?.slug
          await revalidateContent({
            path: `/${collection}/${slug}`,
            tag: `${collection}-sitemap`,
            collection,
            slug,
            payload,
            context,
            type: types
          })
        } catch (error) {
          payload.logger.error(`Error in delete hook: ${error}`)
        }
      }
      return doc
    }
  }
}

export function createGlobalHook(globalSlug: string, options: GlobalHookOptions = {}) {
  const { types = ['page'] } = options

  return async ({ doc, req: { payload, context } }) => {
    if (!context?.disableRevalidate) {
      try {
        await revalidateContent({
          tag: `global_${globalSlug}`,
          payload,
          context,
          type: types
        })
      } catch (error) {
        payload.logger.error(`Error in global hook: ${error}`)
      }
    }
    return doc
  }
}
