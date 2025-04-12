import { NextResponse } from 'next/server'
import configPromise from '@/payload.config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

// Use { params: { slug: string } } for context type matching the directory structure
async function handler(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    // Directly get slug from params
    const { slug } = await context.params
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
            console.log('Received raw body:', text) // Keep log for debugging updates
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

        console.log('Parsed body:', body) // Keep log for debugging updates

        // Extract data from _payload if it exists (This might be specific to certain forms/setups)
        let updateData = body
        if (body && typeof body._payload === 'string') {
          try {
            updateData = JSON.parse(body._payload)
            console.log('Extracted data from _payload:', updateData)
          } catch (e) {
            console.error('Error parsing _payload JSON:', e)
            return NextResponse.json({ message: 'Invalid _payload format' }, { status: 400 })
          }
        }

        const updateDoc = await payload.updateGlobal({
          slug: slug as string,
          data: updateData, // Use the potentially extracted data
          depth,
          locale: locale as 'en' | 'ru' | undefined,
        })
        return NextResponse.json(updateDoc)
      }

      case 'OPTIONS':
        // Standard OPTIONS response
        return new NextResponse(null, {
          status: 200, // Use 200 OK or 204 No Content
          headers: {
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Reflect actual methods
            'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Be specific or allow common ones
            'Access-Control-Allow-Origin': '*', // Or specify your frontend origin for better security
          },
        })

      default:
        // Method Not Allowed
        return new NextResponse(null, { status: 405, headers: { Allow: 'GET, POST, OPTIONS' } })
    }
  } catch (error: any) {
    // Log the detailed error on the server
    console.error(
      `Globals handler error for slug '${context.params ? (await context.params).slug : 'unknown'}':`,
      error,
    )
    // Return a generic error message to the client
    return NextResponse.json(
      {
        message: 'Error processing request', // Keep generic for security
        // Optionally include error details in non-production environments
        // error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export const GET = handler
export const POST = handler
export const OPTIONS = handler
