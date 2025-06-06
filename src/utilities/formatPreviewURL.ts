import type { PayloadRequest } from 'payload'
import { generatePreviewPath } from './generatePreviewPath'

type PreviewData = {
  slug?: string
  [key: string]: any
}

export const formatPreviewURL = (
  collection: 'pages' | 'posts' | 'products' | 'services',
  doc: PreviewData,
  locale?: string,
  req?: PayloadRequest,
): string => {
  const slug = typeof doc?.slug === 'string' ? doc.slug : ''

  // Generate preview path based on collection type
  switch (collection) {
    case 'posts':
      return generatePreviewPath({
        collection,
        slug: `/posts/${slug}`,
        locale,
        req,
      })

    case 'products':
      return generatePreviewPath({
        collection,
        slug: `/products/${slug}`,
        locale,
        req,
      })

    case 'services':
      return generatePreviewPath({
        collection,
        slug: `/services/${slug}`,
        locale,
        req,
      })

    case 'pages':
      return generatePreviewPath({
        collection,
        slug: slug === 'home' ? '/' : `/${slug}`,
        locale,
        req,
      })

    default:
      return '/'
  }
}
