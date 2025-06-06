import type { PayloadRequest } from 'payload'
import { getServerSideURL } from './getURL'

type Args = {
  collection: 'pages' | 'posts' | 'products' | 'services'
  draft?: boolean
  req?: PayloadRequest
  slug?: string
  locale?: string
}

export const generatePreviewPath = ({ collection, slug, locale }: Args): string => {
  const url = getServerSideURL()
  const previewURL = new URL('/next/preview', url)

  // Add required search params
  previewURL.searchParams.append('collection', collection)
  previewURL.searchParams.append('slug', slug || '')
  previewURL.searchParams.append('previewSecret', process.env.PREVIEW_SECRET || '')

  // Add locale if provided
  if (locale) {
    previewURL.searchParams.append('locale', locale)
  }

  return previewURL.toString()
}
