import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { verifyApiKey } from '@/utilities/auth'
import { createCollectionHandlers, isSpecialCollection } from '@/factories/collectionHandlers'
import type { Config } from '@/payload-types'

type CollectionNames = keyof Config['collections']

export async function GET(
  req: Request,
  { params }: { params: { collection: CollectionNames } }
) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { collection } = params
    const { searchParams } = new URL(req.url)
    
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const where = searchParams.get('where') ? JSON.parse(searchParams.get('where')!) : {}
    const sort = searchParams.get('sort') ? JSON.parse(searchParams.get('sort')!) : undefined
    const depth = Number(searchParams.get('depth')) || 1

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: collection,
      where,
      page,
      limit,
      sort,
      depth,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(`API error (${params.collection}):`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { collection: CollectionNames } }
) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { collection } = params
    const payload = await getPayloadClient()

    // Проверяем, требуется ли специальная обработка для коллекции
    if (isSpecialCollection(collection)) {
      const handlers = createCollectionHandlers(payload)
      const formData = await req.formData()
      const result = await handlers[collection].create(formData)
      return NextResponse.json(result)
    }

    // Стандартная обработка для обычных коллекций
    const body = await req.json()
    const result = await payload.create({
      collection: collection,
      data: body,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(`API error (${params.collection}):`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { collection: CollectionNames } }
) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { collection } = params
    const payload = await getPayloadClient()

    if (isSpecialCollection(collection)) {
      const handlers = createCollectionHandlers(payload)
      const formData = await req.formData()
      const id = formData.get('id') as string
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
      }
      const result = await handlers[collection].update(id, formData)
      return NextResponse.json(result)
    }

    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const result = await payload.update({
      collection: collection,
      id,
      data,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(`API error (${params.collection}):`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { collection: CollectionNames } }
) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { collection } = params
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    if (isSpecialCollection(collection)) {
      const handlers = createCollectionHandlers(payload)
      await handlers[collection].delete(id)
      return NextResponse.json({ success: true })
    }

    const result = await payload.delete({
      collection: collection,
      id,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(`API error (${params.collection}):`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
