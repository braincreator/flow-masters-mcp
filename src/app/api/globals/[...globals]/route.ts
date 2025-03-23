import { NextResponse } from 'next/server'
import configPromise from '@/payload.config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

async function handler(req: Request, context: { params: Promise<{ globals: string[] }> }) {
  try {
    const { globals } = await context.params
    const slug = globals[0]
    const url = new URL(req.url)
    const depth = parseInt(url.searchParams.get('depth') || '1')
    const locale = url.searchParams.get('locale') || 'en'

    const payload = await getPayload({ config: await configPromise })

    switch (req.method) {
      case 'GET': {
        if (!slug) return NextResponse.json({ message: 'Missing global slug' }, { status: 400 })
        const getDoc = await payload.findGlobal({
          slug: slug as string,
          depth,
          locale: locale as 'en' | 'ru' | undefined,
        })
        return NextResponse.json(getDoc)
      }

      case 'POST': {
        if (!slug) return NextResponse.json({ message: 'Missing global slug' }, { status: 400 })

        let body
        const contentType = req.headers.get('content-type') || ''

        try {
          if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData()
            body = Object.fromEntries(formData)
          } else {
            // For JSON content type
            const text = await req.text()
            console.log('Received raw body:', text)
            body = text ? JSON.parse(text) : {}
          }
        } catch (e) {
          console.error('Error parsing request body:', e)
          return NextResponse.json(
            {
              message: 'Invalid request body',
              error: e instanceof Error ? e.message : 'Unknown error',
              contentType,
              receivedContentType: req.headers.get('content-type'),
            },
            { status: 400 },
          )
        }

        console.log('Parsed body:', body)

        const updateDoc = await payload.updateGlobal({
          slug: slug as string,
          data: body,
          depth,
          locale: locale as 'en' | 'ru' | undefined,
        })
        return NextResponse.json(updateDoc)
      }

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
  } catch (error: any) {
    console.error('Globals handler error:', error)
    return NextResponse.json(
      {
        message: 'Error processing request',
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

export const GET = handler
export const POST = handler
export const OPTIONS = handler
