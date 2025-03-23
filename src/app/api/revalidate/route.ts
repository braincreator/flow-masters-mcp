import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { revalidateContent } from '@/utilities/revalidation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.path && !body.tag && !body.collection) {
      return NextResponse.json(
        { error: 'At least one of path, tag, or collection is required' },
        { status: 400 }
      )
    }

    await revalidateContent(body)
    return NextResponse.json({ 
      revalidated: true, 
      timestamp: Date.now(),
      details: {
        path: body.path,
        tag: body.tag,
        collection: body.collection,
        slug: body.slug
      }
    })
  } catch (error) {
    console.error('Error in revalidate route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error revalidating' },
      { status: 500 }
    )
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
