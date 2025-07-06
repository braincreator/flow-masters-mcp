import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyApiKey } from '@/utilities/auth'
import { generateMeta } from '@/utilities/generateMeta'
import type { Config } from '@/payload-types'
import type { Metadata } from 'next'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type CollectionNames = keyof Config['collections']
type SupportedCollections = 'pages' | 'posts' | 'products'

export async function GET(req: Request, { params }: { params: { collection: CollectionNames } }) {
  try {
    // Use enhanced authentication system supporting both Bearer and x-api-key formats
    const authResult = await verifyApiKey(req)
    if (authResult) {
      // Authentication failed, return the error response
      return authResult
    }

    const { collection } = params
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const lang = searchParams.get('lang') || 'en'

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    if (!['pages', 'posts', 'products'].includes(collection)) {
      return NextResponse.json(
        { error: 'Metadata not supported for this collection' },
        { status: 400 },
      )
    }

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: collection as SupportedCollections,
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 2,
      limit: 1,
      locale: lang,
    })

    const document = result.docs[0]

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    let metadata: Metadata

    switch (collection) {
      case 'pages':
      case 'posts':
        metadata = await generateMeta({ doc: document })
        break

      case 'products':
        metadata = await generateMeta({
          title: document.title,
          description: document.description,
          image: document.thumbnail?.url,
        })
        break

      default:
        return NextResponse.json({ error: 'Unsupported collection type' }, { status: 400 })
    }

    // Форматируем метаданные для API ответа
    const formattedMetadata = {
      title:
        typeof metadata.title === 'object'
          ? metadata.title.absolute || metadata.title.default
          : metadata.title,
      description: metadata.description,
      openGraph: metadata.openGraph,
      twitter: metadata.twitter,
      alternates: metadata.alternates,
      robots: metadata.robots,
      icons: metadata.icons,
    }

    return NextResponse.json(formattedMetadata)
  } catch (error) {
    logError(`API error (${params.collection}/meta):`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
