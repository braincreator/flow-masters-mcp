import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyApiKey } from '@/utilities/auth'
import type { Config } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type CollectionNames = keyof Config['collections']

export async function GET(
  req: Request,
  { params }: { params: { collection: CollectionNames; id: string } },
) {
  try {
    // Use enhanced authentication system supporting both Bearer and x-api-key formats
    const authResult = await verifyApiKey(req)
    if (authResult) {
      // Authentication failed, return the error response
      return authResult
    }

    const { collection, id } = params
    const { searchParams } = new URL(req.url)
    const depth = Number(searchParams.get('depth')) || 2

    const payload = await getPayloadClient()
    const document = await payload.findByID({
      collection: collection,
      id,
      depth,
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    logError(`API error (${params.collection}/${params.id}):`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
