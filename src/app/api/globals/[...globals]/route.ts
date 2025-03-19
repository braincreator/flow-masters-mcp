import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic'

async function handler(
  req: Request,
  context: { params: Promise<{ globals: string[] }> }
) {
  try {
    const { globals } = await context.params
    const slug = globals[0]
    const url = new URL(req.url)
    const depth = parseInt(url.searchParams.get('depth') || '1')
    const locale = url.searchParams.get('locale') || 'en'
    const fallbackLocale = url.searchParams.get('fallback-locale')

    const payload = await getPayload({ config: await configPromise })

    switch (req.method) {
      case 'GET':
        const doc = await payload.findGlobal({
          slug,
          depth,
          locale,
          fallbackLocale: fallbackLocale || undefined,
        })
        return NextResponse.json(doc)

      case 'POST':
        let body
        try {
          body = await req.json()
        } catch (e) {
          return NextResponse.json(
            { message: 'Invalid JSON body' },
            { status: 400 }
          )
        }

        const updatedDoc = await payload.updateGlobal({
          slug,
          data: body,
          depth,
          locale,
        })
        return NextResponse.json(updatedDoc)

      case 'OPTIONS':
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': '*',
          },
        })

      default:
        return new NextResponse(null, { status: 405 })
    }
  } catch (error) {
    console.error('Globals handler error:', error)
    return NextResponse.json(
      { message: 'Error processing request', error: error.message },
      { status: 500 }
    )
  }
}

export const GET = handler
export const POST = handler
export const OPTIONS = handler
