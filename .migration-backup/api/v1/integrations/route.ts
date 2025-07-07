import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyApiKey } from '@/utilities/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function POST(req: Request) {
  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key')
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    const body = await req.json()
    const { action, collection, data } = body

    // Handle different actions
    switch (action) {
      case 'create':
        const created = await payload.create({
          collection,
          data,
        })
        return NextResponse.json(created)

      case 'update':
        const updated = await payload.update({
          collection,
          where: data.where,
          data: data.update,
        })
        return NextResponse.json(updated)

      case 'delete':
        const deleted = await payload.delete({
          collection,
          where: data.where,
        })
        return NextResponse.json(deleted)

      case 'find':
        const found = await payload.find({
          collection,
          where: data.where,
        })
        return NextResponse.json(found)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logError('Integration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
