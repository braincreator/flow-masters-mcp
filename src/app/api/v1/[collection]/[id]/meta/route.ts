import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { verifyApiKey } from '@/utilities/auth'
import { generateMeta } from '@/utilities/generateMeta'
import type { Config } from '@/payload-types'
import type { Metadata } from 'next'

type CollectionNames = keyof Config['collections']
type SupportedCollections = 'pages' | 'posts' | 'products'

export async function GET(
  req: Request,
  { params }: { params: { collection: CollectionNames; id: string } }
) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { collection, id } = params
    const { searchParams } = new URL(req.url)
    const lang = searchParams.get('lang') || 'en'

    // Проверяем, поддерживается ли коллекция
    if (!['pages', 'posts', 'products'].includes(collection)) {
      return NextResponse.json(
        { error: 'Metadata not supported for this collection' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()
    const document = await payload.findByID({
      collection: collection as SupportedCollections,
      id,
      depth: 2,
      locale: lang,
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
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
        return NextResponse.json(
          { error: 'Unsupported collection type' },
          { status: 400 }
        )
    }

    // Форматируем метаданные для API ответа
    const formattedMetadata = {
      title: typeof metadata.title === 'object' 
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
    console.error(`API error (${params.collection}/${params.id}/meta):`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}