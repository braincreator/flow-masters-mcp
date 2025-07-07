import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import payload from 'payload'
import { bulkRevalidate } from '@/utilities/bulkRevalidate'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Add timeout to prevent hanging requests
const REVALIDATION_TIMEOUT = 30000 // 30 seconds

export async function POST(request: NextRequest) {
  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REVALIDATION_TIMEOUT)

  try {
    const body = await request.json()
    const { collections = ['pages', 'posts', 'products', 'categories'] } = body

    if (!Array.isArray(collections)) {
      return NextResponse.json({ error: 'collections must be an array' }, { status: 400 })
    }

    // Pass abort signal to bulkRevalidate
    await Promise.race([
      bulkRevalidate(payload, collections),
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error('Revalidation timeout')))
      }),
    ])

    return NextResponse.json({
      revalidated: true,
      collections,
      timestamp: Date.now(),
    })
  } catch (error) {
    logError('Error in bulk revalidate route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error revalidating' },
      { status: 500 },
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
