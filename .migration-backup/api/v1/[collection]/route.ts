import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { withAuth } from '@/utilities/auth'
import { createCollectionHandlers, isSpecialCollection } from '@/factories/collectionHandlers'
import type { Config } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type CollectionNames = keyof Config['collections']

export async function GET(
  req: Request,
  { params }: { params: Promise<{ collection: CollectionNames }> },
) {
  return withAuth(req, 'api', async (req) => {
    try {
      const { collection } = await params

      // Skip AI provider routes - they have their own handlers
      if (collection === 'ai' || collection === 'aws') {
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
      }

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
      logError(`API error:`, error)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      )
    }
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: CollectionNames }> },
) {
  return withAuth(req, 'api', async (req) => {
    try {
      const { collection } = await params

      if (!collection) {
        return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
      }

      // Skip AI provider routes - they have their own handlers
      if (collection === 'ai' || collection === 'aws') {
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
      }

      const payload = await getPayloadClient()

      if (isSpecialCollection(collection)) {
        const handlers = createCollectionHandlers(payload)
        const contentType = req.headers.get('content-type') || ''

        if (contentType.includes('multipart/form-data')) {
          const formData = await req.formData()
          const result = await handlers[collection].create(formData)
          return NextResponse.json(result)
        }
      }

      let body
      try {
        body = await req.json()
      } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
      }

      const result = await payload.create({
        collection: collection,
        data: body,
      })

      return NextResponse.json(result)
    } catch (error) {
      logError(`API error:`, error)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      )
    }
  })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ collection: CollectionNames }> },
) {
  return withAuth(req, 'api', async (req) => {
    try {
      const { collection } = await params
      if (!collection) {
        return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
      }

      // Skip AI provider routes - they have their own handlers
      if (collection === 'ai' || collection === 'aws') {
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
      }

      const payload = await getPayloadClient()

      if (isSpecialCollection(collection)) {
        const handlers = createCollectionHandlers(payload)
        const contentType = req.headers.get('content-type') || ''

        if (contentType.includes('multipart/form-data')) {
          const formData = await req.formData()
          const id = formData.get('id') as string
          if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
          }
          const result = await handlers[collection].update(id, formData)
          return NextResponse.json(result)
        }
      }

      let body
      try {
        body = await req.json()
      } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
      }

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
      logError(`API error:`, error)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      )
    }
  })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ collection: CollectionNames }> },
) {
  return withAuth(req, 'api', async (req) => {
    try {
      const { collection } = await params
      if (!collection) {
        return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
      }

      // Skip AI provider routes - they have their own handlers
      if (collection === 'ai' || collection === 'aws') {
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
      }

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
      logError(`API error:`, error)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      )
    }
  })
}
